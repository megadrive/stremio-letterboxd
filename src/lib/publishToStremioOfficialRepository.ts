import { addonFetch } from "./fetch.js";
import { logger } from "../logger.js";
const log = logger("publishToStremioOfficialRepository");

const DEFAULT_API_URL = "https://api.strem.io";

export const publishToCentral = async (
  addonURL: string,
  apiURL = DEFAULT_API_URL
) => {
  try {
    const res = await addonFetch(`${apiURL}/api/addonPublish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportUrl: addonURL, transportName: "http" }),
    });
    if (!res.ok) {
      throw new Error(
        `Failed to publish to stremio official repository: ${res.statusText}`
      );
    }

    const json = (await res.json()) as { error?: string; result?: string };
    if (json.error) {
      throw new Error(
        `Failed to publish to stremio official repository: ${json.error}`
      );
    }
    log(json);
  } catch (error) {
    log(error);
  }
};
