import { Hono } from "hono";
import { createManifest } from "@/util/manifest.js";
import { serverEnv } from "@stremio-addon/env";
import { parseConfigFromUrl } from "@/middleware/parseConfigFromUrl.js";

export const manifestRouter = new Hono();

/**
 * This endpoint gets your user's configuration and is considered the "final" manifest, configured by the user.
 *
 * This is where you can do things like dynamically create catalogs based on the user config provided by `config`,
 * or request certain resources.
 *
 * @configurable-manifest
 * Search: @configuration in packages/config to change the configuration.
 */
manifestRouter.get("/", parseConfigFromUrl, async (c) => {
  const config = c.var.config;

  const safeUrl = encodeURIComponent(config.url);

  const manifest = createManifest({
    id: `com.github.megadrive.stremio-letterboxd-${safeUrl}`,
    // prepend a cute bug for the in-dev version for testing
    name: `${serverEnv.isDev ? "🐛 " : ""}Letterboxd - ${config.catalogName}`,
    version: `2.0.0${serverEnv.isDev ? "-dev" : ""}`,
    catalogs: [
      {
        id: safeUrl,
        name: config.catalogName,
        // @ts-expect-error Custom type
        type: "letterboxd",
      },
    ],
  });

  return c.json(manifest);
});
