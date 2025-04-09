import { createRouter, type AppBindingsWithConfig } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";
import { prisma } from "@stremio-addon/database";
import {
  CatalogMetadataSchema,
  letterboxdCacher,
} from "@/workers/letterboxdCacher.js";
import type { Context } from "hono";
import { serverEnv } from "@stremio-addon/env";
import { createShuffle } from "fast-shuffle";

export const catalogRouter = createRouter();

async function handleCatalogRoute(c: Context<AppBindingsWithConfig>) {
  // If we have a legacy config, we should not proceed
  if (c.get("isLegacyConfig")) {
    const metas: MetaDetail[] = [
      {
        id: "error",
        type: "movie",
        name: "Legacy config detected, please reconfigure the addon.",
        description:
          "The config you are using is no longer supported. Please reconfigure the addon.",
        website: `https://letterboxd.almosteffective.com/`,
      },
    ];
    return c.json({ metas }, INTERNAL_SERVER_ERROR);
  }

  const type = c.req.param("type");
  const id = (c.req.param("id") ?? "").replace(/\.json$/, "");
  const extras = (c.req.param("extras.json") ?? "").replace(/\.json$/, "");

  const parsedExtras = parseExtras(extras);
  c.var.logger.info(
    `[${type}] ${id} with extras: ${JSON.stringify(parsedExtras)}`
  );

  try {
    const encodedConfig = c.var.configString;
    const cached = await prisma.config.findFirst({
      where: {
        config: encodedConfig,
      },
    });

    // kick off an update if the config is not up to date
    letterboxdCacher.addList(c.var.config);

    if (!cached) {
      c.var.logger.error(`Failed to find cached metadata for ${encodedConfig}`);

      return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
    }
    const cachedMetadata = CatalogMetadataSchema.safeParse(
      JSON.parse(cached.metadata)
    );

    if (cachedMetadata.success === false) {
      c.var.logger.error(
        `Failed to parse cached metadata for ${encodedConfig}`
      );
      return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
    }

    const slugs = cachedMetadata.data.items.map((item) => item.id);
    let cachedFilms = await prisma.film.findMany({
      where: {
        id: {
          in: slugs,
        },
      },
    });

    if (!c.var.config.url.includes("/by/shuffle/")) {
      // order the films in the same order as the slugs
      cachedFilms.sort((a, b) => {
        return slugs.indexOf(a.id) - slugs.indexOf(b.id);
      });
    } else {
      // if we are shuffling, get the seed from the database if it exists
      c.var.logger.info(`Shuffling films for ${c.var.config.url}`);
      let seedRecord = await prisma.shuffleSeed.findFirst({
        where: {
          configId: cached.id,
        },
      });
      if (!seedRecord) {
        // create a new seed
        c.var.logger.info(
          `No shuffle seed found for ${c.var.config.url}, creating a new one with configId: ${cached.id}`
        );
        const newSeed = Date.now();
        const newSeedRecord = await prisma.shuffleSeed.upsert({
          where: {
            configId: cached.id,
          },
          create: {
            configId: cached.id,
            seed: `${newSeed}`,
          },
          update: {
            seed: `${newSeed}`,
          },
        });
        c.var.logger.info(`Created new shuffle seed: ${newSeedRecord.seed}`);
        seedRecord = newSeedRecord;
      }

      // randomise the cached films with the seed
      const seededShuffle = createShuffle(+seedRecord.seed);
      cachedFilms = seededShuffle(cachedFilms);
    }

    // pagination
    const start = parsedExtras?.skip ? Number(parsedExtras.skip) : 0;
    let end = start + serverEnv.CATALOG_PAGE_SIZE;
    if (end >= cachedFilms.length) {
      end = cachedFilms.length;
    }
    const paginatedCachedFilms = cachedFilms.slice(start, end);

    const metas: MetaDetail[] = paginatedCachedFilms.map((film) => {
      const poster = (() => {
        const cachedConfigFilmMetadata = cachedMetadata.data.items.find(
          (item) => item.id === film.id
        );

        if (!cachedConfigFilmMetadata) {
          return "";
        }

        if (c.var.config.posterChoice === "letterboxd") {
          return `${c.var.config.origin}/api/poster/${film.id}`;
        }

        if (c.var.config.posterChoice === "letterboxd-custom-from-list") {
          const altId = cachedMetadata.data.items.find(
            (item) => item.id === film.id
          )?.altPoster;
          // if altId is not found, use the default letterboxd poster
          return `${c.var.config.origin}/api/poster/${film.id}${altId ? `/${altId}` : ""}`;
        }

        if (c.var.config.posterChoice === "letterboxd-ratings") {
          return `https://letterboxd-posters-with-ratings.almosteffective.com/${film.id}`;
        }

        if (film.imdb) {
          if (c.var.config.posterChoice === "rpdb") {
            return `https://api.ratingposterdb.com/${c.var.config.rpdbApiKey?.length ? c.var.config.rpdbApiKey : "t0-free-rpdb"}/imdb/poster-default/${film.imdb}.jpg`;
          }
          return `https://images.metahub.space/poster/small/${film.imdb}/img`;
        }

        return "";
      })();

      return {
        id: film.imdb ?? `letterboxd:${film.id}`,
        type: "movie",
        name: film.title,
        description: film.description ?? undefined,
        cast: film.cast ? JSON.parse(film.cast) : undefined,
        director: film.director ? JSON.parse(film.director) : undefined,
        genres: film.genres ? JSON.parse(film.genres) : undefined,
        poster,
      };
    });

    c.header("Cache-Control", "public, max-age=3600");
    return c.json({ metas });
  } catch (error) {
    c.var.logger.error(error);
  }

  return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
}

catalogRouter.get("/:type/:id", handleCatalogRoute);
catalogRouter.get("/:type/:id/:extras.json", handleCatalogRoute);
