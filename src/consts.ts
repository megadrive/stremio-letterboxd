import { env } from "./env.js";

const ONE_HOUR = 3600000;
const THIRTY_SECONDS = 30000;
export const config = {
  /* In milliseconds. When the cached user data is stale. */
  cache_user_stale_time: env.isProduction ? ONE_HOUR : THIRTY_SECONDS,
  /* In milliseconds. When the cached TMDB data is stale. */
  cache_tmdb_stale_time: ONE_HOUR * 24,
};
