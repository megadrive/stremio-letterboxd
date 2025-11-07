import { config } from "dotenv";
import { cleanEnv, str, num, url } from "envalid";
import { join } from "node:path";

// when running in dev, run `pnpm -w dev` to load the .env from the repo root
const envPath = join(process.cwd(), "..", "..", ".env");
console.info(`Loading env from ${envPath}`);
config({
  path: envPath,
});

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
  CATALOG_PAGE_SIZE: num({
    default: 30,
    desc: "How many items to show per page in the catalog.",
  }),
  LETTERBOXD_API_BASE_URL: url({
    default: "https://api.letterboxd.com/api/v0/",
    desc: "Base URL for the Letterboxd API. No trailing slash.",
  }),
  LETTERBOXD_API_KEY: str({
    desc: "The API key for Letterboxd, get one at https://letterboxd.com/api-beta/. If this is a 0 length, the letterboxd source will be skipped.",
    example: "abcd1234abcd1234abcd1234abcd1234",
    default: "",
  }),
  LETTERBOXD_API_AUTH_TYPE: str({
    default: "bearer",
    desc: "The auth type to use for the Letterboxd API. Usually bearer.",
  }),
  METADATA_LEVEL: str({
    default: "basic",
    choices: ["basic", "full"],
    desc: "How much metadata to include in the catalog. basic = IDs, titles, and posters, full = everything (default: basic).",
  }),
  METADATA_PROVIDER_URL: url({
    default: "https://lbxd-id.almosteffective.com",
    desc: "Base URL for the metadata provider addon. No trailing slash.",
  }),
  ELASTICSEARCH_URL: url({
    desc: "The URL for Elasticsearch. If this is a 0 length, the Elasticsearch source will be skipped.",
    example: "http://localhost:9200",
    // purpusefully used a nonsense port
    default: "http://localhost:0000",
  }),
  SOURCE_PRIORITY: str({
    default: "stremthru,cache,letterboxd",
    desc: "The priority order of sources to use. The first source that returns a result will be used.",
  }),
});

export const HOST_LOCAL = `http://localhost:${serverEnv.PORT}`;
