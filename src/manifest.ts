import type { Manifest } from "stremio-addon-sdk";

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
    configurationRequired: true,
  },
};

export default manifest;
