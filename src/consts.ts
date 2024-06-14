import { env } from "./env.js";

const FILMS_PER_PAGE = 28;
export const TOO_MANY_MOVIES = FILMS_PER_PAGE * 10;

export const ONE_HOUR = 3600000;
const THIRTY_SECONDS = 30000;

export const config = {
  // TODO: Determine if the below is redundant
  /* In milliseconds. When the cached user data is stale. */
  cache_user_stale_time: env.isProduction ? ONE_HOUR * 12 : THIRTY_SECONDS,
  /* In milliseconds. When the cached list data is stale. */
  cache_list_stale_time: env.isProduction ? ONE_HOUR * 24 : THIRTY_SECONDS,
  /* In milliseconds. When the cached TMDB data is stale. */
  cache_tmdb_stale_time: ONE_HOUR * 24,
  // TODO: Determine if the above is redundant

  /** The number of films to fetch per page. Determined by Letterboxd. */
  filmsPerPage: FILMS_PER_PAGE,
  /** Threashold of a "big" list, so make TTL longer. */
  filmThreshold: TOO_MANY_MOVIES,
};

export const LetterboxdRegex =
  /https:\/\/(www\.)?letterboxd\.com\/([A-Za-z0-9_]+)(?:\/watchlist)?(\/list\/([A-Za-z0-9\-_]+))?/gi;
// /https:\/\/(www\.)?letterboxd\.com\/([A-Za-z0-9_]+)(\/list\/([A-Za-z0-9\-_]+))?/gi; // keep this here in case above breaks everything

export const LetterboxdUsernameOrListRegex =
  /([A-Za-z0-9_])(|([A-Za-z0-9\-_]+))?/i;

export type StremioMeta = {
  id: string;
  type: "movie" | "series" | "channel" | "tv";
  name: string;
  genres: string[];
  poster?: string;
  posterShape?: "square" | "poster" | "landscape";
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  director?: string[];
  cast?: string[];
  imdbRating?: string;
  released?: string;
  /** @deprecated */
  trailers?: { source: string; type: "Trailer" | "Clip" | string }[];
  links?: {
    name: string;
    category: string;
    url: string;
  }[];
  videos?: {
    id: string;
    title: string;
    released: string;
    thumbnail?: string;
    streams: Record<string, string | number>[];
    available?: boolean;
    episode?: number;
    season?: number;
    trailers?: Record<string, string | number>[];
    overview?: string;
  }[];
  runtime?: string;
  language?: string;
  country?: string;
  awards?: string;
  website?: string;
  behaviorHints?: Partial<{
    defaultVideoID: string;
    hasScheduledVideos: boolean;
  }>;
};

export type StremioMetaPreview = Pick<
  StremioMeta,
  "id" | "type" | "name" | "poster"
> &
  Partial<
    Pick<
      StremioMeta,
      | "genres"
      | "imdbRating"
      | "releaseInfo"
      | "director"
      | "cast"
      | "links"
      | "description"
      | "trailers"
    >
  >;

export type CinemetaMovieResponseLive = {
  meta: {
    id: string;
    imdb_id: string;
    type: "movie" | "series" | "tv";
    poster: string;
    logo: string;
    background: string;
    moviedb_id: number;
    name: string;
    description: string;
    genres: string[];
    releaseInfo: string;
    runtime: string;
    trailers: { source: string; type: string }[];
    cast: string[];
    credits_cast: {
      character: string;
      name: string;
      profile_path: string;
      id: string;
    }[];
    credits_crew: {
      department: string;
      job: string;
      name: string;
      profile: string;
      id: number;
    }[];
    director: string[];
    language: string;
    country: string;
    awards: string;
    imdbRating: string;
    slug: string;
    behaviorHints: {
      defaultVideoId: string;
      hasScheduledVideos: boolean;
    };
  };
};
