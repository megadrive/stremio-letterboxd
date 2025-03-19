import { createRouter } from "@/util/createHono.js";
import type { Subtitle } from "stremio-addon-sdk";

export const subtitleRouter = createRouter();

subtitleRouter.get("/:type/:id.json", async (c) => {
  const config = c.var.config;

  const subtitleExample: Subtitle[] = [
    {
      id: "addonIdPrefix:123456",
      lang: "en",
      url: "https://link.to.subtitles.com",
    },
  ];

  return c.json({ streams: subtitleExample });
});
