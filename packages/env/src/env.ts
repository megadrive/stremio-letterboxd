import "dotenv/config";
import { cleanEnv, str, num, url } from "envalid";

/**
 * Environment variables.
 */
export const serverEnv = cleanEnv(process.env, {
  PORT: num({
    default: 3000,
    desc: "Port to run the addon on. Leave it as 3000 unless you know what you're doing.",
  }),
  NODE_ENV: str({ default: "development" }),
  /**
   * The base URL for the addon. This is required for absolute URLs.
   */
  BASE_URL: url({
    /**
     * ? Default: Astro's default dev domain.
     */
    default: "http://localhost:4321",
    desc: "Required. Base URL for the addon, used for absolute URLs. Leave the last / off.",
    example: "https://base-url-to-your-addon.com",
  }),
  TMDB_APIKEY: str({
    desc: "The API key for TMDb, get one at https://www.themoviedb.org/settings/api",
  }),
  QUEUE_CONCURRENCY: num({
    default: 14,
    desc: "How many concurrent requests to make to Letterboxd. Leave it as 1 unless you know what you're doing.",
  }),
  METADATA_TIME_TO_LIVE: num({
    default: 1000 * 60 * 60 * 24 * 7,
    desc: "How long to cache metadata for in ms. Default is 1 week.",
  }),
  CATALOG_PAGE_SIZE: num({
    default: 30,
    desc: "How many items to show per page in the catalog.",
  }),
});

export const HOST_LOCAL = `http://localhost:${serverEnv.PORT}`;
