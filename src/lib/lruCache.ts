import { prisma } from "../prisma.js";
import { LRUCache } from "lru-cache";
import {
  config,
  ONE_HOUR,
  type StremioMeta,
  type StremioMetaPreview,
} from "../consts.js";
import { logger } from "../logger.js";
const log = logger("lruCache");

const cache = new LRUCache<string, StremioMetaPreview[]>({
  max: 100,
  ttl: ONE_HOUR,
  allowStale: true,
});

export const lruCache = {
  save: async (id: string, providedMetas?: StremioMetaPreview[]) => {
    console.info(
      `[lrucache:save] Start saving ${id} with ${providedMetas?.length} movies provided.`,
    );
    const consoleTime = `lrucache:save ${id}`;
    console.time(consoleTime);

    // if metas provided, save early and quit
    if (providedMetas?.length) {
      cache.set(id, providedMetas);
      log(`[lrucache:save] saved ${id} with ${providedMetas.length} metas`);
      return true;
    }

    const movies = await (async (): Promise<string[] | undefined> => {
      try {
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
    const metas: StremioMeta[] = [];

    // get all cinemeta, if we can
    const cinemetas = await prisma.cinemeta.findMany({
      where: { id: { in: movies } },
    });

    // sort the metas
    for (const movie of movies) {
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
      const cacheOpts: Parameters<typeof cache.set>[2] = {};
      if (metas.length > config.filmThreshold) {
        const amountOver = config.filmThreshold - metas.length;
        const extraTTL = (ONE_HOUR / 2) * amountOver;
        cacheOpts.ttl = extraTTL;
      }
      cache.set(id, metas, cacheOpts);
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
      return metas;
    } catch (error) {
      console.error(`[lrucache:get] Couldn't parse meta JSON`);
      console.error(error);
    }
    return undefined;
  },
};
