import { to } from "await-to-js";
import type {
  FetchReturn,
  ISource,
  SourceOptions,
  SourceResult,
} from "./ISource.js";
import { createCache } from "@/lib/sqliteCache.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";
import { zodParse as parse } from "@/utils/zodParse.js";
import {
  ContributorContributionsSchema,
  ContributorTypeSchema,
  FilmSummarySchema,
  FilmSortSchema,
  FilmsSchema,
  FilmGenresSchema,
  ListEntriesSchema,
  MemberWatchlistSchema,
  LetterboxdTypeSchema,
  FilmSchema,
} from "./Letterboxd.types.js";

const {
  LETTERBOXD_API_BASE_URL,
  LETTERBOXD_API_KEY,
  LETTERBOXD_API_AUTH_TYPE,
} = serverEnv;

const cache = createCache<SourceResult[]>("letterboxd");

// object to base64 string
function convertObjectToBase64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

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
  item: z.infer<typeof FilmSummarySchema>,
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
    director: item.directors?.map((d) => d.name),
    genres: item.genres?.map((g) => g.name),
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

  const obfuscatedKey = `${LETTERBOXD_API_KEY.slice(0, 4)}...${LETTERBOXD_API_KEY.slice(
    -4
  )}`;

  const url = LETTERBOXD_API_BASE_URL + endpoint;
  console.info(`Letterboxd API request: ${url}`);
  console.info(`Authorization: ${obfuscatedKey}`);

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
 * Letterboxd source
 *
 * Fetches data from the Letterboxd API
 */
export class LetterboxdSource implements ISource {
  async getLetterboxdID(path: `/${string}`): Promise<string | null> {
    if (!path) {
      console.warn("No path provided to getLetterboxdID");
      return null;
    }

    const [idErr, idRes] = await to(
      fetch(`https://letterboxd.com${path}`, {
        method: "HEAD",
      })
    );

    if (idErr || !idRes?.ok) {
      console.error(`HEAD request failed for ${path}`);
      return null;
    }

    const lbxdId = idRes.headers.get("x-letterboxd-identifier");
    if (!lbxdId) {
      console.warn(`Failed to get Letterboxd ID for ${path}`);
      return null;
    }

    return lbxdId;
  }

  async getFilm(id: string): Promise<z.infer<typeof FilmSchema> | null> {
    if (!id) {
      console.warn("No film ID provided to getFilm");
      return null;
    }

    const [filmErr, filmRes] = await to(apiRequest(`/film/${id}`));
    if (filmErr || !filmRes) {
      console.error(`Failed to fetch Letterboxd film ${id}: ${filmErr}`);
      return null;
    }

    const film = parse(filmRes, FilmSchema);
    if (!film) {
      console.error(`Failed to parse Letterboxd film ${id}`);
      return null;
    }

    return film;
  }

  async fetch(
    opts: SourceOptions &
      Required<Pick<SourceOptions, "url">> & {
        filmId?: string;
        shouldCache?: boolean;
        sort?: z.infer<typeof FilmSortSchema>;
        skip?: number;
      }
  ): FetchReturn {
    opts = {
      shouldCache: true,
      sort: "MemberRatingHighToLow",
      ...opts,
    };

    const { url } = opts;

    if (LETTERBOXD_API_KEY.length === 0) {
      console.warn(`Letterboxd API key not set, moving along...`);
      return { shouldStop: false, metas: [] };
    }

    // figure out what endpoint we're after
    const urlObj = new URL(url);

    const urlParsed = (():
      | {
          endpoint: EndpointType;
          contributorType?: string;
          username?: string;
        }
      | undefined => {
      // remove extra slashes
      const pathname = urlObj.pathname.replace(/\/+/g, "/");
      // /username/list/list-name/
      // /actor/john-doe/
      // /username/watchlist/
      // /films/popular/
      // /films/popular/this/week
      const [usernameOrType, listOrWatchlist] = pathname
        .split("/")
        .filter((p) => p.length > 0);

      if (listOrWatchlist === "list") {
        return {
          endpoint: "list",
        };
      }

      // function for SpecialEffects and similar should become special-effects
      const toKebabCase = (str: string) =>
        str
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .replace(/[\s_]+/g, "-")
          .toLowerCase();

      const contributorTypes = ContributorTypeSchema.options.map((o) =>
        toKebabCase(o)
      );
      let contributorType: string | undefined = undefined;
      if (
        contributorTypes.some((type, i) => {
          if (pathname.startsWith(`/${type}/`)) {
            contributorType = ContributorTypeSchema.options[i];
            return true;
          }
        })
      ) {
        return {
          endpoint: "contributor",
          contributorType,
        };
      }

      // /username/watchlist/
      if (usernameOrType && listOrWatchlist === "watchlist") {
        return {
          endpoint: "member_watchlist",
          username: usernameOrType,
        };
      }

      // /films/popular
      if (pathname.startsWith("/films/popular")) {
        return {
          endpoint: "film_popular",
        };
      }

      return undefined;
    })();

    if (!urlParsed) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return { shouldStop: false, metas: [] };
    }

    const { endpoint, contributorType, username } = urlParsed;

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
      return { shouldStop: false, metas: [] };
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

    const cacheKey = `${endpoint}:${lbxdId}:${convertObjectToBase64(opts)}`;

    console.info(`Got Letterboxd list ID ${lbxdId} for ${url}`);

    if (opts.shouldCache) {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        console.info(`Using cached Letterboxd list data for ${url}`);

        return {
          shouldStop: true,
          metas: cachedData,
        };
      }
    }

    console.info(
      `No cached Letterboxd ${cacheKey} data for ${url}, fetching...`
    );

    // fetch the data
    console.info(`Fetching Letterboxd list data for ${url} (ID: ${lbxdId})`);

    console.debug({ opts, sort: opts.sort });
    const PAGE_SIZE = 100;
    const searchParams = new URLSearchParams();
    searchParams.set("perPage", PAGE_SIZE.toString());
    if (opts.filmId) {
      searchParams.set("filmId", opts.filmId);
    }
    if (opts.sort) {
      searchParams.set("sort", opts.sort);
    }
    if (opts.skip) {
      searchParams.set("cursor", `start=${opts.skip}`);
    }

    // add types for contributor
    if (lbxdType === "Contributor" && contributorType) {
      searchParams.set("type", contributorType);
    }

    if (endpoint === "film_popular") {
      // /films/popular/this/all-time/decade/2020s/genre/action/on/apple-itunes-au/
      const filmsOptions = ["this", "decade", "genre", "on", "by"];
      // pull out any films options from the URL
      const pathParts = new URL(url).pathname
        .split("/")
        .filter((p) => p.length > 0);
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
                  searchParams.set("sort", "FilmPopularityThisYear");
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
      return {
        shouldStop: false,
        metas: [],
      };
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
      return { shouldStop: false, metas: [] };
    }

    let metadata;

    // Validate the API result
    const validated = (() => {
      let v;
      switch (endpoint.toLowerCase()) {
        case "list":
          v = parse(lbxdRes, ListEntriesSchema);
          metadata = v?.metadata;
          return v?.items.map((i) => i.film);
        case "contributor":
          v = parse(lbxdRes, ContributorContributionsSchema);
          metadata = v?.metadata.find((m) => m.type === contributorType)?.data;
          return v?.items.map((i) => i.film);
        case "member_watchlist": {
          v = parse(lbxdRes, MemberWatchlistSchema);
          metadata = { totalFilmCount: v?.items.length || 0 };
          return parse(lbxdRes, MemberWatchlistSchema)?.items;
        }
        case "film_popular":
          v = parse(lbxdRes, FilmsSchema);
          return v?.items;
        default:
          console.error(`Unsupported Letterboxd type: ${lbxdType}`);
          return null;
      }
    })();
    if (!validated) {
      return { shouldStop: false, metas: [] };
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
      `Letterboxd list ${lbxdId}: fetched ${listData.length}${metadata ? `/${metadata?.filteredFilmCount || ""}` : ``} items`
    );

    if (opts.shouldCache && listData.length > 0) {
      console.info(
        `Caching Letterboxd ${cacheKey} data for ${url} (ID: ${lbxdId})`
      );
      await cache.set(cacheKey, listData, 1000 * 60 * 60); // 1 hour
    }

    return {
      shouldStop: listData.length === 0,
      metas: listData,
    };
  }
}
