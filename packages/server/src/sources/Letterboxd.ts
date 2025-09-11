import { to } from "await-to-js";
import type { ISource, SourceOptions, SourceResult } from "./ISource.js";
import { createCache } from "./ISource.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";
import { FilmSchema, ListEntriesSchema } from "./Letterboxd.types.js";

const cache = createCache<z.infer<typeof ListEntriesSchema>>("letterboxd");

type EndpointType = "list";

const {
  LETTERBOXD_API_BASE_URL,
  LETTERBOXD_API_KEY,
  LETTERBOXD_API_AUTH_TYPE,
} = serverEnv;

const toSourceResult = (item: z.infer<typeof FilmSchema>): SourceResult => {
  const imdb = item.links.find((link) => link.type === "imdb")?.id;
  const tmdb = item.links.find((link) => link.type === "tmdb")?.id;
  if (!tmdb) {
    // type guard
    // this should never throw as letterboxd films always have a tmdb id
    throw new Error(`No TMDb ID for Letterboxd film ${item.name}`);
  }

  return {
    id: item.id,
    name: item.name,
    poster: item.poster?.sizes.sort((a, b) => b.width - a.width)[0]?.url,
    imdb,
    tmdb,
  };
};

export class LetterboxdSource implements ISource {
  async fetch(
    opts: SourceOptions &
      Required<Pick<SourceOptions, "url">> & {
        filmId?: string;
        shouldCache?: boolean;
      }
  ): Promise<SourceResult[]> {
    opts = {
      shouldCache: true,
      ...opts,
    };

    const { url } = opts;

    if (LETTERBOXD_API_KEY.length === 0) {
      console.warn(`Letterboxd API key not set, moving along...`);
      return [];
    }

    // figure out what endpoint we're after
    const urlObj = new URL(url);

    // list is only supported for now
    let endpoint: EndpointType | null = null;

    if (urlObj.pathname.includes("/list/")) {
      endpoint = "list";
    }

    if (!endpoint) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return [];
    }

    // get the list ID
    const [listIdErr, listIdRes] = await to(
      fetch(url, {
        method: "HEAD",
      })
    );

    if (listIdErr || !listIdRes?.ok) {
      console.error(`HEAD request failed for ${url}`);
      return [];
    }

    const listId = listIdRes.headers.get("x-letterboxd-identifier");

    if (!listId) {
      console.error(`Failed to get Letterboxd list ID for ${url}`);
      return [];
    }

    console.info(`Got Letterboxd list ID ${listId} for ${url}`);

    if (opts.shouldCache) {
      const cachedData = await cache.get(listId);
      if (cachedData) {
        console.info(`Using cached Letterboxd list data for ${url}`);
        return cachedData.items.map((i) => i.film).map(toSourceResult);
      }
    }

    console.info(`No cached Letterboxd list data for ${url}, fetching...`);

    // fetch the data
    const headers = new Headers();
    switch (LETTERBOXD_API_AUTH_TYPE.toLowerCase()) {
      case "bearer":
        headers.set("Authorization", `Bearer ${LETTERBOXD_API_KEY}`);
        break;
      case "rapidapi":
        headers.set("X-RapidAPI-Key", LETTERBOXD_API_KEY);
        headers.set("X-RapidAPI-Host", new URL(LETTERBOXD_API_BASE_URL).host);
        break;
    }

    console.info(`Fetching Letterboxd list data for ${url} (ID: ${listId})`);

    const PAGE_SIZE = 100;
    const searchParams = new URLSearchParams();
    searchParams.set("perPage", PAGE_SIZE.toString());
    if (opts.skip) {
      searchParams.set("cursor", `skip=${opts.skip}`);
    }
    if (opts.filmId) {
      searchParams.set("filmId", opts.filmId);
    }

    const apiListUrl = `${LETTERBOXD_API_BASE_URL}/list/${listId}/entries?${searchParams.toString()}`;
    console.info(`Fetching Letterboxd list data from ${apiListUrl}`);
    const [lbxdErr, lbxdRes] = await to(
      fetch(apiListUrl, {
        headers,
      })
    );

    if (lbxdErr || !lbxdRes?.ok) {
      console.warn(lbxdErr, lbxdRes);
      console.error(
        `Failed to fetch Letterboxd list data for ${url} (ID: ${listId}): ${lbxdErr}`
      );
      return [];
    }

    const [parseErr, parsed] = await to(lbxdRes.json());
    if (parseErr || !parsed) {
      console.error(
        `Failed to parse Letterboxd list data for ${url} (ID: ${listId}): ${parseErr}`
      );
      return [];
    }

    const validated = ListEntriesSchema.safeParse(parsed);
    if (!validated.success) {
      console.error(
        `Failed to validate Letterboxd list data for ${url} (ID: ${listId})`
      );
      console.error(validated.error);
      return [];
    }

    console.info(
      `Fetched and validated Letterboxd list data for ${url} (ID: ${listId})`
    );

    let listData: SourceResult[] = validated.data.items
      .map((i) => i.film)
      .map(toSourceResult);

    listData = listData.map((item) => {
      // convert id to slug
      // find the item in the validated list
      const validatedItem = validated.data.items.find(
        (i) => i.film.id === item.id
      );
      if (validatedItem) {
        const link = validatedItem.film.link;
        const slugMatch = link.match(/\/film\/([^/]+)/);
        if (slugMatch && slugMatch[1]) {
          return {
            ...item,
            id: slugMatch[1],
          };
        }
      }

      return {
        ...item,
        id: "",
      };
    });

    console.info(
      `Letterboxd list ${listId}: fetched ${listData.length} items, total ${listData.length} items`
    );

    if (opts.shouldCache && listData.length > 0) {
      console.info(`Caching Letterboxd list data for ${url} (ID: ${listId})`);
      await cache.set(listId, validated.data, 1000 * 60 * 60); // 1 hour
    }

    return listData;
  }
}
