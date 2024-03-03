import type { Manifest } from "stremio-addon-sdk";

export type ManifestExpanded = Manifest & {
  behaviorHints?: { configurable?: boolean; configurationRequired?: boolean };
  config?: {
    key: string;
    type: "text" | "number" | "password" | "checkbox" | "select";
    default?: "checked" | string;
    title?: string;
    options?: string[];
    required?: boolean;
    special: "anonymous";
  }[];
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
  },
  config: [
    {
      title: "A user's Letterboxd URL or a List URL",
      key: "letterboxdUrl",
      type: "text",
      special: "anonymous",
      required: true,
    },
  ],
};

export default manifest;
