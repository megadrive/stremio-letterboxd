import path, { join } from "path";
import { prisma } from "../prisma.js";
import { addonFetch } from "./fetch.js";
import { readFile, writeFile } from "node:fs/promises";

const __dirname = path.resolve(path.dirname(""));

/** Too many movies, truncate Cinemeta data. */
const TOO_MANY_MOVIES = 500;

const generatePath = (id: string) =>
  join(
    __dirname,
    "static",
    "lists",
    `${decodeURIComponent(id).replace(/(\||%7C)/g, "-")}.json`
  );

const writing = new Set<string>();

type Cache = {
  metas: any[];
  expires: number;
  cacheTime: number;
};

export const staticCache = {
  generateUrl: (username: string): string => {
    return `/lists/${decodeURIComponent(username).replace(
      /(\||%7C)/g,
      "-"
    )}.json`;
  },

  save: async (id: string, movieIds?: string[]) => {
    console.info(
      `[staticCache:save] Start saving ${id} with ${
        movieIds ? movieIds.length : 0
      } movies provided.`
    );
    const filename = generatePath(id);
    console.info(`File: ${filename}`);
    const consoleTime = `staticCache:save ${id}`;
    console.time(consoleTime);
    if (writing.has(id)) {
      console.info(`already saving ${id}`);
      return;
    }

    const movies = await (async (): Promise<string[] | undefined> => {
      try {
        if (!movieIds) {
          // grab list
          const user = await prisma.letterboxdUser.findUnique({
            where: {
              id,
            },
          });
          try {
            if (!user) {
              throw `No user with the ID: ${id}`;
            }
          } catch (error) {
            console.warn(`[static_cache] ${error}`);
            return undefined;
          }

          return JSON.parse(user.movie_ids) as string[];
        } else {
          return movieIds;
        }
      } catch (error) {
        console.error(`[staticCache:save] Couldn't get movie IDs`);
      }

      return undefined;
    })();

    if (!movies) {
      console.warn(`[staticCache:save] Couldn't save ${id}`);
      writing.delete(id);
      return undefined;
    }

    // get meta from movies
    const metas: any[] = [];

    for (let movie of movies) {
      try {
        const cinemeta = await prisma.cinemeta.findFirst({
          where: { id: movie },
        });
        if (!cinemeta) continue;
        metas.push(JSON.parse(cinemeta.info));
      } catch {
        console.warn(`Couldn't get Cinemeta for ${movie}, continuing.`);
        continue;
      }
    }

    // save to static file
    writing.add(id);
    try {
      // If more than 1000 entries, change the expiry time to 60 multiplied by the amount of movies to limit large fetches.
      const expires =
        metas.length > TOO_MANY_MOVIES
          ? Date.now() + 1000 * 60 * metas.length
          : Date.now() + 1000 * 60 * 60;
      await writeFile(
        filename,
        JSON.stringify({ metas: metas, cacheTime: Date.now(), expires }),
        {
          encoding: "utf8",
          flag: "w",
        }
      );
    } catch (error) {
      console.error(`Couldn't save staticCache ${id}`);
      console.error(error);
      return { status: "error", message: error.message, error };
    }
    writing.delete(id);
    console.timeEnd(consoleTime);
    return { status: "success", filePath: generatePath(id), metas };
  },
  get: async (id: string) => {
    console.info(`Trying to get ${id} static cache`);
    try {
      const file = await readFile(generatePath(id), { encoding: "utf8" });
      const metas = JSON.parse(file) as Cache;
      console.info(
        `Fetched ${id}, expires at ${new Date(metas.expires ?? Date.now())}`
      );
      return metas;
    } catch (error) {
      console.error(`[static_cache] Couldn't parse el JSON`);
      console.error(error);
      return null;
    }
  },
};
