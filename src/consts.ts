export const is_prod = process.env.NODE_ENV === "prod";

const ONE_HOUR = 3600000;
export const config = {
  /* In milliseconds. When the cached user data is stale. */
  cache_user_stale_time: is_prod ? ONE_HOUR : 30000,
  /* In milliseconds. When the cached TMDB data is stale. */
  cache_tmdb_stale_time: ONE_HOUR * 24,
};
