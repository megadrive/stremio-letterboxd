import { cleanEnv, str, url } from "envalid";

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  URL_DEV: url({ default: "http://localhost:3030" }),
  URL_PRODUCTION: url({
    default: "https://stremio-letterboxd-watchlist.up.railway.app",
  }),
});