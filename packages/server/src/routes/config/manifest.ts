import { createRouter } from "@/util/createHono.js";
import { createManifest } from "@/util/manifest.js";
import { serverEnv } from "@stremio-addon/env";

export const manifestRouter = createRouter();

/**
 * This endpoint gets your user's configuration and is considered the "final" manifest, configured by the user.
 *
 * This is where you can do things like dynamically create catalogs based on the user config provided by `config`,
 * or request certain resources.
 *
 * @configurable-manifest
 * Search: @configuration in packages/config to change the configuration.
 */
manifestRouter.get("/", async (c) => {
  const config = c.var.config;

  const manifest = createManifest({
    id: "com.example.addon",
    name: "Example Addon with config",
    description: `Configured values: ${Object.keys(config).join(", ")}`,
    version: `1.0.0${serverEnv.isDev ? "-dev" : ""}`,
  });

  return c.json(manifest);
});
