import { env } from "./env.js";

const rv: Record<string, boolean> = {};
for (const key in env) {
  if (key.startsWith("ADDON_FEATURE_")) {
    let newKey = key as string;
    newKey = newKey.replace("ADDON_FEATURE_", "");
    // convert to camelCase
    newKey = newKey
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    rv[newKey] = env[key as keyof typeof env] === true;
  }
}

export const features = rv;

console.info(`Feature flags: ${JSON.stringify(features)}`);
