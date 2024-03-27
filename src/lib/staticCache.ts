import path, { join } from "path";
import { prisma } from "../prisma.js";
import { findMovie } from "./cinemeta.js";
import { addonFetch } from "./fetch.js";
import { readFile, writeFile } from "node:fs/promises";

const __dirname = path.resolve(path.dirname(""));

const generatePath = (id: string) =>
  join(__dirname, "static", "lists", `${id.replace("|", "-")}.json`);

const writing = new Set<string>();

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
    if (!user) {
      throw Error(`[static_cache] no user by id ${id}`);
    }

    // get meta from movies
    const movies = JSON.parse(user.movie_ids) as string[];
    const metas: any[] = [];

    for (let movie of movies) {
      const res = await addonFetch(
        `https://v3-cinemeta.strem.io/catalog/movie/last-videos/lastVideosIds=${movie}`
      );
      if (!res.ok) continue;
      const meta = (await res.json()) as Record<string, any>;
      metas.push(meta.metasDetailed[0]);
    }

    // save to static file
    writing.add(id);
    try {
      await writeFile(
        generatePath(id),
        JSON.stringify({ metas: metas, cacheTime: Date.now() }),
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
    try {
      const file = await readFile(generatePath(id), { encoding: "utf8" });
      const metas = JSON.parse(file) as Record<string, any>;
      return metas;
    } catch (error) {
      console.error(`[static_cache] Couldn't parse el JSON`);
      console.error(error);
      return null;
    }
  },
};
