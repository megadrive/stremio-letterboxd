import { env } from "./env.js";

const ONE_HOUR = 3600000;
const THIRTY_SECONDS = 30000;
export const config = {
  /* In milliseconds. When the cached user data is stale. */
  cache_user_stale_time: env.isProduction ? ONE_HOUR : 0,
  /* In milliseconds. When the cached TMDB data is stale. */
  cache_tmdb_stale_time: ONE_HOUR * 24,
};

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
