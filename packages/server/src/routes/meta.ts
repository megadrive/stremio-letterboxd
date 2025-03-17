import { Hono } from "hono";
import type { MetaDetail } from "stremio-addon-sdk";

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = new Hono();

metaRouter.get("/:type/:id.json", async (c) => {
  const metaExample: MetaDetail = {
    id: "addonIdPrefix:123456",
    name: "Stremio Addon Example",
    type: "movie",
    description: "This is an example meta response.",
  };

  return c.json({ meta: metaExample });
});
