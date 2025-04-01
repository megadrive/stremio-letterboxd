import { createRouter } from "@/util/createHono.js";
import { addonManifest, createManifest } from "@/util/manifest.js";
import {
  determineCatalogName,
  letterboxdCacher,
} from "@/workers/letterboxdCacher.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";

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
  const conf = c.var.config;

  let catalogName = conf.catalogName;
  try {
    if (!catalogName) {
      // if the catalog name is not provided, determine it from the letterboxd page
      catalogName = await determineCatalogName({
        url: conf.url,
      });
    }
  } catch {
    c.var.logger.error("Failed to determine catalog name.");
    return c.text("", INTERNAL_SERVER_ERROR);
  }

  let posterChoice = "";
  switch (conf.posterChoice) {
    case "cinemeta":
      posterChoice = "Cinemeta";
      break;
    case "letterboxd":
      posterChoice = "Letterboxd";
      break;
    case "letterboxd-ratings":
      posterChoice = "Letterboxd Ratings";
      break;
    case "letterboxd-custom-from-list":
      posterChoice = "List";
      break;
    case "rpdb":
      posterChoice = `RPDb (${conf.rpdbApiKey ? "paid" : "free"})`;
      break;
  }

  const manifest = createManifest({
    ...addonManifest,
    id: `${addonManifest.id}:${c.var.configString}`,
    name: `Letterboxd - ${catalogName}`,
    description: `Adds ${catalogName} as a catalog. Using ${posterChoice} posters.`,
    resources: [
      {
        name: "meta",
        types: ["movie"],
        idPrefixes: ["letterboxd:"],
      },
    ],
    catalogs: [
      {
        id: c.var.configString,
        name: catalogName,
        // @ts-expect-error Custom Type
        type: "letterboxd",
        extra: [
          {
            name: "skip",
            isRequired: false,
          },
        ],
      },
    ],
  });

  // once the manifest is created, begin caching films
  letterboxdCacher.addList(conf);

  return c.json(manifest);
});
