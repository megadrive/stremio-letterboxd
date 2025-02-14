import type { Manifest } from "stremio-addon-sdk";
import { features } from "./featureFlags.js";

export type ManifestExpanded = Manifest & {
  behaviorHints?: { configurable?: boolean; configurationRequired?: boolean };
};

const manifest: ManifestExpanded = {
  id: "github.megadrive.stremio.letterboxd",
  version: "1.0.0",
  name: "Letterboxd",
  logo: "https://stremio-letterboxd-watchlist.up.railway.app/logo.png",
  description: "Addon to add Letterboxd lists as catalogs",
  /** @ts-ignore */
  types: ["letterboxd"],
  resources: ["catalog"],
  catalogs: [],
  behaviorHints: {
    configurable: true,
    /** Only set to true if Stremio makes it workable with non-SDK addons. */
    // configurationRequired: false,
  },
  contactEmail: "stremio@almosteffective.com",
};

// feature flags
if (features.tmdbRedirect) {
  manifest.resources = [
    ...manifest.resources,
    {
      name: "meta",
      types: ["movie"],
      idPrefixes: ["letterboxd-tmdb:"],
    },
  ] as ManifestExpanded["resources"];
}

export default manifest;
