import { to } from "await-to-js";
import type { ISource, SourceOptions, SourceResult } from "./ISource.js";
import { createCache } from "./ISource.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";
import {
  ContributorContributionsSchema,
  ContributorTypeSchema,
  FilmSchema,
  ListEntriesSchema,
} from "./Letterboxd.types.js";

const cache = createCache<z.infer<typeof ListEntriesSchema>>("letterboxd");

type EndpointType = "list" | "contributor";

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

/**
 * Parse a JSON object with a Zod schema, logging any errors
 * @param data JSON
 * @param schema Zod schema
 * @returns Parsed data or null if parsing failed
 */
function parse<T>(data: unknown, schema: z.Schema<T>) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error(`Failed to parse Letterboxd list data`);
    console.error(parsed.error);
    return null;
  }
  return parsed.data;
}

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
    let contributorType: string | null = null;

    // remove extra slashes
    const pathname = urlObj.pathname.replace(/\/+/g, "/");
    if (pathname.startsWith("/list/")) {
      endpoint = "list";
    }
    const contributorTypes = ContributorTypeSchema.options.map((o) =>
      o.toLowerCase()
    );
    if (
      contributorTypes.some((type, i) => {
        if (pathname.startsWith(`/${type}/`)) {
          contributorType = ContributorTypeSchema.options[i];
          return true;
        }
      })
    ) {
      endpoint = "contributor";
    }

    if (!endpoint) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return [];
    }

    // get the list ID
    const [lbxdIdErr, lbxdIdRes] = await to(
      fetch(url, {
        method: "HEAD",
      })
    );

    if (lbxdIdErr || !lbxdIdRes?.ok) {
      console.error(`HEAD request failed for ${url}`);
      return [];
    }

    const lbxdId = lbxdIdRes.headers.get("x-letterboxd-identifier");
    const lbxdType = lbxdIdRes.headers.get("x-letterboxd-type");

    if (!lbxdId) {
      console.error(`Failed to get Letterboxd list ID for ${url}`);
      return [];
    }

    if (!lbxdType) {
      console.error(`Failed to get Letterboxd type for ${url}`);
      return [];
    }

    const cacheKey = `${lbxdType}:${lbxdId}`;

    console.info(`Got Letterboxd list ID ${lbxdId} for ${url}`);

    if (opts.shouldCache) {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        console.info(`Using cached Letterboxd list data for ${url}`);
        return cachedData.items.map((i) => i.film).map(toSourceResult);
      }
    }

    console.info(
      `No cached Letterboxd ${cacheKey} data for ${url}, fetching...`
    );

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

    console.info(`Fetching Letterboxd list data for ${url} (ID: ${lbxdId})`);

    const PAGE_SIZE = 100;
    const searchParams = new URLSearchParams();
    searchParams.set("perPage", PAGE_SIZE.toString());
    if (opts.skip) {
      searchParams.set("cursor", `skip=${opts.skip}`);
    }
    if (opts.filmId) {
      searchParams.set("filmId", opts.filmId);
    }

    // add types for contributor
    if (lbxdType === "Contributor" && contributorType) {
      searchParams.set("type", contributorType);
    }

    const apiUrls = {
      list: `${LETTERBOXD_API_BASE_URL}/${lbxdType.toLowerCase()}/list/${lbxdId}/entries?${searchParams.toString()}`,
      contributor: `${LETTERBOXD_API_BASE_URL}/${lbxdType.toLowerCase()}/${lbxdId}/contributions?${searchParams.toString()}`,
    };
    const apiUrl = apiUrls[lbxdType.toLowerCase() as keyof typeof apiUrls];
    if (!apiUrl) {
      console.error(`Unsupported Letterboxd type: ${lbxdType}`);
      return [];
    }
    console.info(
      `Fetching Letterboxd data from ${apiUrl} for ${url} (ID: ${lbxdId})`
    );
    const [lbxdErr, lbxdRes] = await to(
      fetch(apiUrl, {
        headers,
      })
    );

    if (lbxdErr || !lbxdRes?.ok) {
      console.warn(lbxdErr, lbxdRes);
      console.error(
        `Failed to fetch Letterboxd list data for ${url} (ID: ${lbxdId}): ${lbxdErr}`
      );
      return [];
    }

    const [parseErr, parsed] = await to(lbxdRes.json());
    if (parseErr || !parsed) {
      console.error(
        `Failed to parse Letterboxd list data for ${url} (ID: ${lbxdId}): ${parseErr}`
      );
      return [];
    }

    const validated = (() => {
      switch (lbxdType) {
        case "List":
          return parse(parsed, ListEntriesSchema);
        case "Contributor":
          return parse(parsed, ContributorContributionsSchema);
        default:
          console.error(`Unsupported Letterboxd type: ${lbxdType}`);
          return null;
      }
    })();
    if (!validated) {
      return [];
    }

    console.info(
      `Fetched and validated Letterboxd data for ${url} (ID: ${lbxdId})`
    );

    let listData: SourceResult[] = validated.items
      .map((i) => i.film)
      .map(toSourceResult);

    listData = listData.map((item) => {
      // convert id to slug
      // find the item in the validated list
      const validatedItem = validated.items.find((i) => i.film.id === item.id);
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
      `Letterboxd list ${lbxdId}: fetched ${listData.length} items, total ${listData.length} items`
    );

    if (opts.shouldCache && listData.length > 0) {
      console.info(
        `Caching Letterboxd ${cacheKey} data for ${url} (ID: ${lbxdId})`
      );
      await cache.set(cacheKey, validated, 1000 * 60 * 60); // 1 hour
    }

    return listData;
  }
}
