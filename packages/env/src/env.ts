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
});

export const HOST_LOCAL = `http://localhost:${serverEnv.PORT}`;
