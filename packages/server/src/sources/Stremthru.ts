import { to } from "await-to-js";
import {
  createCache,
  type ISource,
  type SourceOptions,
  type SourceResult,
} from "./ISource.js";
import { StremthruResponseSchema } from "./Stremtru.types.js";
const cache = createCache<SourceResult[]>("stremthru");

const STREMTHRU_API_BASE = "https://stremthru.13377001.xyz/v0";
const STREMTHRU_URLS = {
  list: "/meta/letterboxd/lists/{id}",
  watchlist: "/meta/letterboxd/users/{id}/lists/watchlist",
};

export class StremthruSource implements ISource {
  async fetch(
    opts: Required<Pick<SourceOptions, "url">> & SourceOptions
  ): Promise<{ shouldStop: boolean; metas: SourceResult[] }> {
    if (!opts.url) {
      return {
        shouldStop: false,
        metas: [],
      };
    }

    // fetch cache and serve if available
    const cached = await cache.get(opts.url);
    if (cached) {
      return {
        shouldStop: true,
        metas: cached,
      };
    }

    /*
    Potential list urls:
    - User watchlist: https://letterboxd.com/username/watchlist/
    - List: https://letterboxd.com/username/list/list-name/
    */
    const url = new URL(opts.url);
    let apiUrl = "";
    if (url.pathname.endsWith("/watchlist/")) {
      apiUrl =
        STREMTHRU_API_BASE +
        STREMTHRU_URLS.watchlist.replace(/watchlist\/$/, "");
      opts.url = url.origin + url.pathname.replace(/watchlist\/$/, "");
    } else if (url.pathname.includes("/list/")) {
      apiUrl = STREMTHRU_API_BASE + STREMTHRU_URLS.list;
    } else {
      return {
        shouldStop: true,
        metas: [],
      };
    }

    console.log("Stremthru API URL:", apiUrl);

    console.log(`Getting ID from ${url.pathname}`);
    const [idErr, idRes] = await to(
      fetch(opts.url, {
        headers: {
          Accept: "application/json",
        },
      })
    );

    if (idErr || !idRes?.ok) {
      console.warn(`Error fetching ID from ${apiUrl}`, idErr, idRes?.status);
      return {
        shouldStop: true,
        metas: [],
      };
    }

    const id = idRes.headers.get("x-letterboxd-identifier");

    if (!id) {
      console.warn("No ID found in headers");
      return {
        shouldStop: true,
        metas: [],
      };
    }

    const apiUrlWithId = apiUrl.replace("{id}", id);
    console.log(`Fetching list data for ID ${id} from ${apiUrlWithId}`);
    const [dataErr, dataRes] = await to(
      fetch(apiUrlWithId, {
        headers: {
          Accept: "application/json",
        },
      })
    );

    if (dataErr || !dataRes?.ok) {
      console.warn("Error fetching list data", dataErr, dataRes?.status);
      return {
        shouldStop: false,
        metas: [],
      };
    }

    const validatedData = StremthruResponseSchema.safeParse(
      await dataRes.json()
    );
    if (!validatedData.success) {
      console.warn("Error validating list data", validatedData.error);
      return {
        shouldStop: false,
        metas: [],
      };
    }

    const { data: listData } = validatedData.data;

    // if we get less items than what is expected, move along
    if (listData.item_count !== listData.items.length) {
      console.warn(
        `List item count mismatch: expected ${listData.item_count}, got ${listData.items.length}`
      );
      return {
        shouldStop: false,
        metas: [],
      };
    }

    // as stremthru doesn't have sorting, we sort ourselves
    // get the sort from the url. it will be the final part after /by/
    const sort = (() => {
      // https://letterboxd.com/username/list/list-name/by/rating/
      const howToSort = opts.url.split("/by/")[1];
      if (!howToSort) {
        return undefined;
      }

      if (howToSort === "") {
        return undefined;
      }

      return howToSort;
    })();

    switch (sort) {
      case "reversed":
        listData.items.reverse();
        break;
      case "name":
        listData.items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "added":
        listData.items.sort(
          (a, b) => a.updated_at.getTime() - b.updated_at.getTime()
        );
        break;
      case "added-earliest":
        listData.items.sort(
          (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
        );
        break;
      case "release":
        listData.items.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case "release-earliest":
        listData.items.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
    }

    const metas: SourceResult[] = listData.items.map((item) => ({
      id: `id-${item.id}`,
      name: item.title,
      poster: item.poster,
      type: item.type === "movie" ? "movie" : "series",
      description: item.description,
      imdb: item.id_map.imdb,
      tmdb: item.id_map.tmdb ?? "",
    }));

    // cache data
    await cache.set(opts.url, metas, 60 * 60); // 1 hour

    return {
      shouldStop: true,
      metas,
    };
  }
}
