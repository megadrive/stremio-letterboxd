import { serverEnv } from "@stremio-addon/env";
import type { Manifest } from "stremio-addon-sdk";

/**
 * The manifest base of the addon.
 *
 * This gets cloned and modified when a user installs the addon in server.
 *
 * ! You do not have to edit anything in this object.
 */
const manifestBase: Manifest = {
  id: "",
  name: "",
  description: "",
  version: "",
  catalogs: [],
  resources: [],
  types: ["movie", "series"],
} as const;

/**
 * Create a new manifest.
 * NOTE: Remember that each "call" to your addon runs in isolation. There is no "app state" aside from the config sent in the URL.
 */
export const createManifest = (opts: Partial<Manifest>): Manifest => {
  return {
    ...manifestBase,
    ...opts,
  };
};

/**
 * ? Addon configuration
 *
 * This is where you can give your addon an id, display name, etc. Essentially anything that will not change when the addon is updated.
 * You can do cool things like dynamically create catalogs, or request certain resources. You do that in the line marked: @configurable-manifest
 */
export const addonManifest = createManifest({
  id: "github.megadrive.stremio.letterboxd",
  name: "Letterboxd",
  version: `2.0.0${serverEnv.isDev ? "-dev" : ""}`,
  description: "Adds a Letterboxd URL as a catalog.",
  logo: "https://stremio-letterboxd-watchlist.up.railway.app/logo.png",
  catalogs: [],
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
  // @ts-expect-error stremio-addons.net validation
  stremioAddonsConfig: {
    issuer: "https://stremio-addons.net",
    signature:
      "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..zhrjmLGDChFm-qb-uWRzFw.UxMdnE1qrqnMUNJp0h1tKhHInzukAMP7gomVYUGrUsKO32U8izcbKEcWwKVGAa0qyb8k_JVkyvsTgAHHSEdzFwxgexejseZ241nT0But9L4RAAvGU_GUsPpEe0__d20Z.fLtFn1wImV9-9I0JAHby3Q",
  },
});
