import { createRouter } from "@/util/createHono.js";
import { addonManifest, createManifest } from "@/util/manifest.js";
import { determineCatalogName } from "@/workers/letterboxdCacher.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";
import { to } from "await-to-js";
import type { ManifestCatalog } from "stremio-addon-sdk";
import { config as addonConfig } from "@stremio-addon/config";

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
  const catalogs: ManifestCatalog[] = [];
  const posterChoices: string[] = [];

  c.var.logger.debug({ configs: c.var.configs });

  for (const { config } of c.var.configs) {
    const conf = config;

    let catalogName = conf.catalogName;
    if (!catalogName) {
      // if the catalog name is not provided, determine it from the letterboxd page
      const [nameErr, name] = await to(
        determineCatalogName({
          url: conf.url,
        })
      );

      if (nameErr) {
        c.var.logger.error("Failed to determine catalog name.");
        return c.text(nameErr.message, INTERNAL_SERVER_ERROR);
      }

      if (!name) {
        c.var.logger.error("Failed to determine catalog name.");
        return c.text(
          "Failed to determine catalog name.",
          INTERNAL_SERVER_ERROR
        );
      }

      catalogName = name;
    }

    switch (conf.posterChoice) {
      case "cinemeta":
        posterChoices.push("Cinemeta");
        break;
      case "letterboxd":
        posterChoices.push("Letterboxd");
        break;
      case "letterboxd-ratings":
        posterChoices.push("Letterboxd Ratings");
        break;
      case "letterboxd-custom-from-list":
        posterChoices.push("List");
        break;
      case "rpdb":
        posterChoices.push(`RPDb (${conf.rpdbApiKey ? "paid" : "free"})`);
        break;
    }

    // figure out the sort
    let sort = "Default";
    console.info("Config URL:", conf.url);
    const splitUrl = conf.url.split("/").filter((part) => part.length > 0);
    const byIndex = splitUrl.indexOf("by");
    if (byIndex !== -1 && byIndex < splitUrl.length - 1) {
      sort = splitUrl[byIndex + 1];
      // convert hyphens to spaces and capitalize each word
      sort = sort
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // base64 encode the config to use as the id
    // const id = Buffer.from(JSON.stringify(conf)).toString("base64");
    const id = await addonConfig.encode(conf);

    catalogs.push({
      // use the config id if available, otherwise generate one from the URL
      id,
      name: catalogName,
      // @ts-expect-error Custom Type
      type: "letterboxd",
      extra: [
        {
          name: "skip",
          isRequired: false,
        },
        // NOTE: adding this back in causes it to not show up on the main page
        // {
        //   name: "genre",
        //   isRequired: true,
        //   options: [sort],
        // },
      ],
    });
  }

  const manifest = createManifest({
    ...addonManifest,
    behaviorHints: {
      ...addonManifest.behaviorHints,
      configurable: true,
      configurationRequired: false,
    },
    id: `${addonManifest.id}:${c.var.configId}`,
    name: "Letterboxd",
    description: `Adds Letterboxd pages and lists as catalogs! Using ${posterChoices.join(
      ", "
    )} for posters.`,
    resources: [
      {
        name: "meta",
        types: ["movie"],
        idPrefixes: ["letterboxd:"],
      },
    ],
    catalogs,
  });

  return c.json(manifest);
});
