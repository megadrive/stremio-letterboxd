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
  resources: ["meta"],
  types: ["movie", "series"],
};

/**
 * Create a new manifest.
 * NOTE: Remember that each "call" to your addon runs in isolation. There is no "app state" aside from the config sent in the URL.
 */
export const createManifest = (
  opts: Pick<Manifest, "id" | "name"> & Partial<Omit<Manifest, "id" | "name">>
): Manifest => {
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
  id: "org.your.addon.id",
  name: "Stremio Addon Starter",
  version: "0.0.0",
});
