import { bool, cleanEnv, num, str, url } from "envalid";
import { config } from "dotenv";
config();

export const env = cleanEnv(process.env, {
  /** Database URL, must relate to a Prisma-supported database. See /prisma.schema for more info. */
  DATABASE_URL: str(),
  /** Server port to run on. If you deploy this to a service, they'll override this. */
  PORT: num({ default: 3030 }),
  /**
   * The maximum number of pages to fetch from a Letterboxd list. Ends up being around 980 movies for a user list, and 3500 for a "popular" list.
   * Note that popular lists will only grab the first page.
   * */
  ADDON_MAX_PAGES_FETCHED: num({ default: 35 }),
  /** Whether to return the full metadata for each film, or just the minimum. */
  ADDON_FULL_METADATA: bool({ default: false }),
  /** Skip validating metas on manifest generation. Useful for testing and self-hosting.*/
  ADDON_SKIP_MANIFEST_VALIDATION: bool({ default: false }),
  /** Whether to publish to the Stremio official repository, requires to be in production. */
  ADDON_PUBLISH_TO_STREMIO: bool({ default: false }),
  /** Grab metadata from Letterboxd instead of Cinemeta. */
  ADDON_LETTERBOXD_METADATA: bool({ default: true }),
  /** RPDB API key, used for RPDB posters. If empty, RPDB posters will not be used. */
  ADDON_RPDB_APIKEY: str({ default: "" }),

  ADDON_LETTERBOXD_POSTER_WIDTH: num({ default: 1000 }),
  ADDON_LETTERBOXD_POSTER_HEIGHT: num({ default: 1500 }),

  ADDON_FEATURE_TMDB_REDIRECT: bool({ default: true }),
  ADDON_FEATURE_TMDB_FETCH: bool({ default: false }),
  ADDON_TMDB_APIKEY: str({ default: "" }),

  /** Used for public instance. Used in development primarily. */
  RAILWAY_PUBLIC_DOMAIN: str({ default: "http://localhost:3030" }),
});
