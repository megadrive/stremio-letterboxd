import { dirname, join, resolve } from "path";
import { addonFetch } from "../lib/fetch.js";
import { readFile, writeFile } from "fs/promises";
import type { CinemetaMovieResponseLive } from "../consts.js";
import MiniSearch from "minisearch";
import { prisma } from "../prisma.js";

const __dirname = resolve(dirname(""));
const CINEMETA_FILEPATH = join(__dirname, "cinemeta-cache.json");

const CINEMETA_URL =
  "https://cinemeta.strem.io/stremioget/stremio/v1/q.json?b=eyJwYXJhbXMiOltudWxsLHt9XSwibWV0aG9kIjoibmFtZXMubW92aWUiLCJpZCI6MSwianNvbnJwYyI6IjIuMCJ9";

type CinemetaV1Result = {
  jsonrpc: string;
  id: number;
  result: {
    _id: string;
    imdb_id: string;
    name: string;
    type: string;
    year: string;
  }[];
};

const parseCinemetaResponse = (s: string): CinemetaV1Result["result"] => {
  return JSON.parse(s);
};

const getCinemeta = async (): Promise<CinemetaV1Result["result"]> => {
  try {
    const cache = await readFile(CINEMETA_FILEPATH, { encoding: "utf8" });
    if (cache) {
      return parseCinemetaResponse(cache);
    }
  } catch (error) {
    console.error("Couldn't open cache.");
    if (error.code === "ENOENT") {
      console.error(error);
    }
  }

  try {
    const res = await addonFetch(CINEMETA_URL);
    if (!res.ok) throw Error("Couldn't fetch Cinemeta.");
    const fetched = await res.json();

    writeFile(CINEMETA_FILEPATH, JSON.stringify(fetched.result), {
      encoding: "utf8",
      flag: "w",
    })
      .then(() => console.log("Cached Cinemeta"))
      .catch((err) => console.error(`Couldn't save cache.`, err));

    return fetched.result;
  } catch (err) {
    console.error(err);
  }
  return [];
};

const minisearch = new MiniSearch({
  idField: "imdb_id",
  fields: ["name", "year"],
  storeFields: ["name", "imdb_id", "year"],
  searchOptions: {
    fuzzy: 0.3,
  },
});

(async () => {
  const data = await getCinemeta();
  minisearch.addAll(data);
  console.log(`Added ${minisearch.documentCount} to search`);
})();

export const findMovie = (
  query: string,
  options?: Parameters<typeof minisearch.search>[1]
) => {
  try {
    console.info(`[minisearch] finding ${query}`);
    const results = minisearch.search(query, options);
    console.info(`[minisearch] finding ${query} -> ${results.length} results.`);

    return results;
  } catch (error) {
    console.error(`[minisearch] Couldn't find ${query}`);
    console.error(error);
    return [];
  }
};

export const fetchCachedIDs = async (
  imdbIDs: string[]
): Promise<{} | { id: string; meta: CinemetaMovieResponseLive }> => {
  try {
    const filteredIDs = imdbIDs.filter((id) => id.startsWith("tt"));
    const cached = await prisma.cinemeta.findMany({
      where: {
        id: {
          in: filteredIDs,
        },
      },
    });

    const withInfo = cached.map((cache) => {
      return {
        id: cache.id,
        meta: JSON.parse(cache.info),
      };
    });

    console.log(withInfo);

    return withInfo;
  } catch (error) {
    console.error("Couldn't get cached Cinemeta data.");
    console.error(error);
  }

  return {};
};
