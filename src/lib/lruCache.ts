import path, { join } from "path";
import { prisma } from "../prisma.js";
import { LRUCache } from "lru-cache";
import { ONE_HOUR, StremioMeta } from "../consts.js";

const cache = new LRUCache<string, StremioMeta[]>({
  max: 100,
  ttl: ONE_HOUR,
  allowStale: true,
});

const __dirname = path.resolve(path.dirname(""));

const generatePath = (id: string) =>
  join(
    __dirname,
    "static",
    "lists",
    `${decodeURIComponent(id).replace(/(\||%7C)/g, "-")}.json`
  );

export const lruCache = {
  save: async (id: string, movieIds?: string[]) => {
    console.info(
      `[lrucache:save] Start saving ${id} with ${
        movieIds ? movieIds.length : 0
      } movies provided.`
    );
    const consoleTime = `lrucache:save ${id}`;
    console.time(consoleTime);

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
            console.warn(`[lrucache:save] ${error}`);
            return undefined;
          }

          return JSON.parse(user.movie_ids) as string[];
        } else {
          return movieIds;
        }
      } catch (error) {
        console.error(`[lrucache:save] Couldn't get movie IDs`);
      }

      return undefined;
    })();

    if (!movies) {
      console.warn(`[lrucache:save] Couldn't save ${id}`);
      console.timeEnd(consoleTime);
      return undefined;
    }

    // get meta from movies
    const metas: any[] = [];

    // get all cinemeta, if we can
    const cinemetas = await prisma.cinemeta.findMany({
      where: { id: { in: movies } },
    });

    // sort the metas
    for (let movie of movies) {
      // find the cinemeta entry and push it to metas
      const foundMovie = cinemetas.findIndex((m) => m.id === movie);
      if (foundMovie === -1) continue;
      const meta = JSON.parse(cinemetas[foundMovie].info) as StremioMeta;
      metas.push(meta);
    }

    try {
      // If more than 1000 entries, change the expiry time to 60 multiplied by the amount of movies to limit large fetches.
      // const expires =
      //   metas.length > TOO_MANY_MOVIES
      //     ? Date.now() + 1000 * 60 * metas.length
      //     : Date.now() + 1000 * 60 * 60;
      console.info(`[lrucache:save]: saving ${id} with ${metas.length} metas`);
      cache.set(id, metas);
      return true;
    } catch (error) {
      console.error(`[lrucache:save] Couldn't save staticCache ${id}`);
      console.error(error);
      console.timeEnd(consoleTime);
    }
    console.timeEnd(consoleTime);
    return false;
  },

  get: (id: string) => {
    console.info(`[lrucache:get] Trying to get ${id} static cache`);
    try {
      const metas = cache.get(id);
      console.info(`first get ${metas ? metas[0]?.name : "no"}`);
      return metas;
    } catch (error) {
      console.error(`[lrucache:get] Couldn't parse meta JSON`);
      console.error(error);
    }
    return undefined;
  },
};
