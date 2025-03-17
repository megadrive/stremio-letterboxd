import { Hono } from "hono";
import type { Subtitle } from "stremio-addon-sdk";

export const subtitleRouter = new Hono();

subtitleRouter.get("/:type/:id.json", async (c) => {
  const subtitleExample: Subtitle[] = [
    {
      id: "addonIdPrefix:123456",
      lang: "en",
      url: "https://link.to.subtitles.com",
    },
  ];

  return c.json({ streams: subtitleExample });
});
