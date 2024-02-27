import { env } from "./env.js";

const ONE_HOUR = 3600000;
const THIRTY_SECONDS = 30000;
export const config = {
  /* In milliseconds. When the cached user data is stale. */
  cache_user_stale_time: env.isProduction ? ONE_HOUR : 30,
  /* In milliseconds. When the cached TMDB data is stale. */
  cache_tmdb_stale_time: ONE_HOUR * 24,
};

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
  trailers?: { source: string; type: "Trailer" | "Clip" };
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
