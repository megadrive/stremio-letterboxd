import { createRouter } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";

export const catalogRouter = createRouter();

catalogRouter.get("/:type/:id/:extras?.json", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");
  const extras = c.req.param("extras");

  const parsedExtras = parseExtras(extras);
  console.info(`[${type}] ${id} with extras: ${JSON.stringify(parsedExtras)}`);

  const catalogExample: MetaDetail[] = [
    {
      id: "addonIdPrefix:123456",
      name: "Stremio Addon Example",
      type: "movie",
      description: "This is an example meta response.",
    },
    {
      id: "addonIdPrefix:78901",
      name: "Stremio Addon Example 2",
      type: "movie",
      description: "This is another example meta response.",
    },
  ];

  return c.json({ metas: catalogExample });
});
