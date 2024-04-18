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
  expires?: number;
  cacheTime: number;
};

export const staticCache = {
  save: async (id: string) => {
    if (writing.has(id)) {
      console.info(`already saving ${id}`);
      return;
    }

    // grab list
    const user = await prisma.letterboxdUser.findUnique({
      where: {
        id,
      },
    });
    try {
      if (!user) {
        throw Error(`[static_cache] no user by id ${id}`);
      }
    } catch {
      console.warn("[static_cache] No user by that ID.");
      return;
    }

    // get meta from movies
    const movies = JSON.parse(user.movie_ids) as string[];
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
      // If more than 1000 entries, change the expiry time to 60
      const expires =
        metas.length > TOO_MANY_MOVIES
          ? Date.now() + 1000 * 60 * metas.length
          : undefined;
      await writeFile(
        generatePath(id),
        JSON.stringify({ metas: metas, cacheTime: Date.now(), expires }),
        {
          encoding: "utf8",
          flag: "w",
        }
      );
    } catch (error) {
      console.error(`Couldn't save staticCache ${id}`);
      console.error(error);
    }
    writing.delete(id);
  },
  get: async (id: string) => {
    console.info(`Trying to get ${id} static cache`);
    try {
      const file = await readFile(generatePath(id), { encoding: "utf8" });
      const metas = JSON.parse(file) as Cache;
      return metas;
    } catch (error) {
      console.error(`[static_cache] Couldn't parse el JSON`);
      console.error(error);
      return null;
    }
  },
};
