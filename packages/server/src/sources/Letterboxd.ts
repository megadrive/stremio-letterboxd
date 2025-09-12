import { to } from "await-to-js";
import type { ISource, SourceOptions, SourceResult } from "./ISource.js";
import { createCache } from "./ISource.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";
import {
  ContributorContributionsSchema,
  ContributorTypeSchema,
  FilmSchema,
  FilmSortSchema,
  FilmsSchema,
  FilmGenresSchema,
  ListEntriesSchema,
  MemberWatchlistSchema,
  LetterboxdTypeSchema,
} from "./Letterboxd.types.js";

const {
  LETTERBOXD_API_BASE_URL,
  LETTERBOXD_API_KEY,
  LETTERBOXD_API_AUTH_TYPE,
} = serverEnv;

const cache = createCache<z.infer<typeof ListEntriesSchema>>("letterboxd");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EndpointTypeSchema = z.enum([
  "list",
  "contributor",
  "member_watchlist",
  "film_popular",
]);
type EndpointType = z.infer<typeof EndpointTypeSchema>;

const [genresErr, genresRes] = await to(apiRequest("/films/genres"));
if (genresErr || !genresRes) {
  console.error(`Failed to fetch Letterboxd genres: ${genresErr}`);
}
const GENRES = parse(genresRes, FilmGenresSchema)?.items.reduce(
  (acc, genre) => {
    acc[genre.name.toLowerCase()] = genre.id;
    return acc;
  },
  {} as Record<string, string>
);
if (!GENRES) {
  console.error(`Failed to parse Letterboxd genres`);
}

const toSourceResult = (
  item: z.infer<typeof FilmSchema>,
  additionalData: Partial<SourceResult> = {}
): SourceResult => {
  const imdb = item.links.find((link) => link.type === "imdb")?.id;
  const tmdb = item.links.find((link) => link.type === "tmdb")?.id;
  if (!tmdb) {
    // type guard
    // this should never throw as letterboxd films always have a tmdb id
    throw new Error(`No TMDb ID for Letterboxd film ${item.name}`);
  }

  const minimal: SourceResult = {
    id: item.id,
    name: item.name,
    poster: item.poster?.sizes.sort((a, b) => b.width - a.width)[0]?.url,
    imdb,
    tmdb,
    director: item.directors.map((d) => d.name),
    genres: item.genres.map((g) => g.name),
  };

  const full: SourceResult = {
    ...minimal,
    ...additionalData,
  };

  return full;
};

/**
 * Perform an API request to Letterboxd
 * @param endpoint API endpoint, e.g. /list/12345/entries
 * @param opts Any fetch options
 * @returns Raw JSON response
 */
async function apiRequest(
  endpoint: string,
  opts: RequestInit = {}
): Promise<unknown> {
  if (LETTERBOXD_API_KEY.length === 0) {
    throw new Error("Letterboxd API key not set");
  }

  const headers = new Headers(opts.headers);
  switch (LETTERBOXD_API_AUTH_TYPE.toLowerCase()) {
    case "bearer":
      headers.set("Authorization", `Bearer ${LETTERBOXD_API_KEY}`);
      break;
    case "rapidapi":
      headers.set("X-RapidAPI-Key", LETTERBOXD_API_KEY);
      headers.set("X-RapidAPI-Host", new URL(LETTERBOXD_API_BASE_URL).host);
      break;
  }

  const url = LETTERBOXD_API_BASE_URL + endpoint;
  console.info(`Letterboxd API request: ${url}`);

  const [resErr, res] = await to(
    fetch(url, {
      ...opts,
      headers,
    })
  );

  if (resErr || !res?.ok) {
    console.error(resErr, res);
    throw new Error(`Failed to fetch Letterboxd API: ${resErr}`);
  }

  const [parseErr, parsed] = await to(res.json() as Promise<unknown>);
  if (parseErr || !parsed) {
    throw new Error(
      `Failed to parse JSON Letterboxd API response: ${parseErr}`
    );
  }

  return parsed;
}

/**
 * Parse a JSON object with a Zod schema, logging any errors
 * @param data JSON
 * @param schema Zod schema
 * @returns Parsed data or null if parsing failed
 */
function parse<T>(data: unknown, schema: z.Schema<T>): T | null {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error(`Failed to parse Letterboxd list data`);
    console.error(parsed.error);
    return null;
  }
  return parsed.data;
}

/**
 * Letterboxd source
 *
 * Fetches data from the Letterboxd API
 */
export class LetterboxdSource implements ISource {
  async fetch(
    opts: SourceOptions &
      Required<Pick<SourceOptions, "url">> & {
        filmId?: string;
        shouldCache?: boolean;
        sort?: z.infer<typeof FilmSortSchema>;
      }
  ): Promise<SourceResult[]> {
    opts = {
      shouldCache: true,
      sort: "ListRanking",
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

    const regex_list = /^\/([^/]+)\/(list)\/([^/]+)\/?/;
    const list_match = pathname.match(regex_list);
    if (list_match) {
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

    // /username/watchlist
    const regex_watchlist = /^\/([^/]+)\/(watchlist)\/?$/;
    const watchlist_match = pathname.match(regex_watchlist);
    let username: string | null = null;
    if (watchlist_match) {
      endpoint = "member_watchlist";
      username = watchlist_match[1];
    }

    // /films/popular
    if (pathname.startsWith("/films/popular")) {
      endpoint = "film_popular";
    }

    if (!endpoint) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return [];
    }

    const urlForId =
      endpoint === "member_watchlist" && username
        ? `https://letterboxd.com/${username}/`
        : url;

    // get the list ID
    const [lbxdIdErr, lbxdIdRes] = await to(
      fetch(urlForId, {
        method: "HEAD",
      })
    );

    if (lbxdIdErr || !lbxdIdRes?.ok) {
      console.error(`HEAD request failed for ${url}`);
      return [];
    }

    const lbxdId = lbxdIdRes.headers.get("x-letterboxd-identifier");
    const lbxdType = LetterboxdTypeSchema.optional().parse(
      lbxdIdRes.headers.get("x-letterboxd-type")
    );

    if (!lbxdId) {
      console.warn(`Failed to get Letterboxd list ID for ${url}`);
    }

    if (!lbxdType) {
      console.warn(`Failed to get Letterboxd type for ${url}`);
    }

    const cacheKey = `${endpoint}:${lbxdId}`;

    console.info(`Got Letterboxd list ID ${lbxdId} for ${url}`);

    if (opts.shouldCache) {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        console.info(`Using cached Letterboxd list data for ${url}`);

        return cachedData.items
          .map((i) => i.film)
          .map((f) => toSourceResult(f));
      }
    }

    console.info(
      `No cached Letterboxd ${cacheKey} data for ${url}, fetching...`
    );

    // fetch the data
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
    if (opts.sort) {
      searchParams.set("sort", opts.sort);
    }

    // add types for contributor
    if (lbxdType === "Contributor" && contributorType) {
      searchParams.set("type", contributorType);
    }

    if (endpoint === "film_popular") {
      // /films/popular/this/all-time/decade/2020s/genre/action/on/apple-itunes-au/
      const filmsOptions = ["this", "decade", "genre", "on", "by"];
      // pull out any films options from the URL
      const pathParts = pathname.split("/").filter((p) => p.length > 0);
      for (let i = 1; i < pathParts.length; i++) {
        if (filmsOptions.includes(pathParts[i])) {
          const key = pathParts[i];
          const value = pathParts[i + 1];
          if (value && !filmsOptions.includes(value)) {
            if (key === "genre" && GENRES && GENRES[value]) {
              // convert genre slug to genre name
              searchParams.set(key, GENRES[value]);
              i = i + 2;
              continue;
            }

            if (key === "this") {
              switch (value) {
                case "week":
                  searchParams.set("sort", "FilmPopularityThisWeek");
                  break;
                case "month":
                  searchParams.set("sort", "FilmPopularityThisMonth");
                  break;
                case "year":
                  searchParams.set("sort", "filmPopularityThisYear");
                  break;
                case "all-time":
                  searchParams.set("sort", "FilmPopularity");
                  break;
                default:
                  console.warn(`Unknown period value: ${value}`);
              }
            }

            searchParams.set(key, value);
            i = i + 2;
          }
        }
      }
    }

    const apiUrls: Record<EndpointType, string> = {
      list: `/list/${lbxdId}/entries`,
      contributor: `/contributor/${lbxdId}/contributions`,
      member_watchlist: `/member/${lbxdId}/watchlist`,
      film_popular: `/films`,
    };
    // nullishable to avoid TS complaining
    const apiUrl = apiUrls[endpoint.toLowerCase() as keyof typeof apiUrls];
    if (!apiUrl) {
      console.error(`Unknown API URL key: ${lbxdType}`);
      return [];
    }
    console.info(
      `Fetching Letterboxd data from ${apiUrl} for ${url} (ID: ${lbxdId})`
    );
    const [lbxdErr, lbxdRes] = await to(
      apiRequest(`${apiUrl}?${searchParams.toString()}`)
    );

    if (lbxdErr) {
      console.warn(lbxdErr, lbxdRes);
      console.error(
        `Failed to fetch Letterboxd list data for ${url} (ID: ${lbxdId}): ${lbxdErr}`
      );
      return [];
    }

    // Validate the API result
    const validated = (() => {
      switch (endpoint.toLowerCase()) {
        case "list":
          return parse(lbxdRes, ListEntriesSchema)?.items.map((i) => i.film);
        case "contributor":
          return parse(lbxdRes, ContributorContributionsSchema)?.items.map(
            (i) => i.film
          );
        case "member_watchlist": {
          return parse(lbxdRes, MemberWatchlistSchema)?.items;
        }
        case "film_popular":
          return parse(lbxdRes, FilmsSchema)?.items;
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

    let listData: SourceResult[] = validated.map((f) => toSourceResult(f));

    listData = listData.map((item) => {
      // convert id to slug
      // find the item in the validated list
      const validatedItem = validated.find((i) => i.id === item.id);
      if (validatedItem) {
        const link = validatedItem.link;
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
        id: `tmdb:${item.tmdb}`,
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
