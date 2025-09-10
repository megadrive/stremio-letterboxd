import { to } from "await-to-js";
import type { ISource, SourceOptions, SourceResult } from "./ISource.js";
import { createCache } from "./ISource.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";
import { ListSchema } from "./Letterboxd.types.js";

const cache = createCache<z.infer<typeof ListSchema>>("letterboxd");

type EndpointType = "list";

const {
  LETTERBOXD_API_BASE_URL,
  LETTERBOXD_API_KEY,
  LETTERBOXD_API_AUTH_TYPE,
} = serverEnv;

const toSourceResult = (
  item: z.infer<typeof ListSchema>["previewEntries"][number]
): SourceResult => {
  return {
    id: item.film.id,
    name: item.film.name,
    poster: item.film.poster?.sizes.sort((a, b) => b.width - a.width)[0]?.url,
  };
};

export class LetterboxdSource implements ISource {
  async fetch(
    opts: Required<Pick<SourceOptions, "url">>
  ): Promise<SourceResult[]> {
    const { url } = opts;

    if (LETTERBOXD_API_KEY.length === 0) {
      console.warn(`Letterboxd API key not set, moving along...`);
      return [];
    }

    // figure out what endpoint we're after
    const urlObj = new URL(url);

    // list is only supported for now
    let endpoint: EndpointType | null = null;

    if (urlObj.pathname.includes("/list/")) {
      endpoint = "list";
    }

    if (!endpoint) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return [];
    }

    // get the list ID
    const [listIdErr, listIdRes] = await to(
      fetch(url, {
        method: "HEAD",
      })
    );

    if (listIdErr || !listIdRes?.ok) {
      console.error(`HEAD request failed for ${url}`);
      return [];
    }

    const listId = listIdRes.headers.get("x-letterboxd-identifier");

    if (!listId) {
      console.error(`Failed to get Letterboxd list ID for ${url}`);
      return [];
    }

    console.info(`Got Letterboxd list ID ${listId} for ${url}`);

    const cachedData = await cache.get(listId);
    if (cachedData) {
      console.info(`Using cached Letterboxd list data for ${url}`);
      return cachedData.previewEntries.map(toSourceResult);
    }

    console.info(`No cached Letterboxd list data for ${url}, fetching...`);

    // fetch the data
    const headers = new Headers();
    switch (LETTERBOXD_API_AUTH_TYPE.toLowerCase()) {
      case "bearer":
        headers.set("Authorization", `Bearer ${LETTERBOXD_API_KEY}`);
        break;
      case "rapidapi":
        headers.set("X-RapidAPI-Key", LETTERBOXD_API_KEY);
        headers.set("X-RapidAPI-Host", new URL(LETTERBOXD_API_BASE_URL).host);
        break;
    }

    console.info(`Fetching Letterboxd list data for ${url} (ID: ${listId})`);

    const apiListUrl = `${LETTERBOXD_API_BASE_URL}/list/${listId}`;
    console.info(`Fetching Letterboxd list data from ${apiListUrl}`);
    const [lbxdErr, lbxdRes] = await to(
      fetch(apiListUrl, {
        headers,
      })
    );

    if (lbxdErr || !lbxdRes?.ok) {
      console.warn(lbxdErr, lbxdRes);
      console.error(
        `Failed to fetch Letterboxd list data for ${url} (ID: ${listId}): ${lbxdErr}`
      );
      return [];
    }

    const [parseErr, parsed] = await to(lbxdRes.json());
    if (parseErr || !parsed) {
      console.error(
        `Failed to parse Letterboxd list data for ${url} (ID: ${listId}): ${parseErr}`
      );
      return [];
    }

    const validated = ListSchema.safeParse(parsed);
    if (!validated.success) {
      console.error(
        `Failed to validate Letterboxd list data for ${url} (ID: ${listId})`
      );
      console.error(validated.error);
      return [];
    }

    console.info(
      `Fetched and validated Letterboxd list data for ${url} (ID: ${listId})`
    );

    let listData: SourceResult[] =
      validated.data.previewEntries.map(toSourceResult);

    listData = listData.map((item) => {
      // convert id to slug
      // find the item in the validated list
      const validatedItem = validated.data.previewEntries.find(
        (i) => i.film.id === item.id
      );
      if (validatedItem) {
        const link = validatedItem.film.link;
        const slugMatch = link.match(/\/film\/([^/]+)/);
        if (slugMatch && slugMatch[1]) {
          return {
            ...item,
            id: slugMatch[1],
          };
        }
      }

      return {
        ...item,
        id: "",
      };
    });

    await cache.set(listId, validated.data, 1000 * 60 * 60); // 1 hour

    return listData;
  }
}
