import { bool, cleanEnv, num, str, url } from "envalid";

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

  ADDON_LETTERBOXD_METADATA: bool({ default: false }),

  ADDON_RPDB_APIKEY: str(),

  RAILWAY_PUBLIC_DOMAIN: str({ devDefault: "http://localhost:3030" }),
});
