import { createRouter, type AppBindingsWithConfig } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";
import { prisma } from "@stremio-addon/database";
import type { Context } from "hono";
import { serverEnv } from "@stremio-addon/env";
import { createShuffle } from "fast-shuffle";
import { to } from "await-to-js";

import type { SourceResult } from "@/sources/ISource.js";
import { CacheSource } from "@/sources/CacheSource.js";
import { LetterboxdSource } from "@/sources/Letterboxd.js";
import { FilmSortSchema } from "@/sources/Letterboxd.types.js";

const SOURCES = [new LetterboxdSource(), new CacheSource()];

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

    if (!cached) {
      c.var.logger.error(`Failed to find cached metadata for ${encodedConfig}`);

      return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
    }

    let data: SourceResult[] = [];
    let successfulSource: string | null = null;
    for (const source of SOURCES) {
      const [sourceDataErr, sourceData] = await to(
        source.fetch({
          url: c.var.config.url,
          config: c.var.config,
          configString: c.var.configString,
          skip: parsedExtras?.skip ? Number(parsedExtras.skip) : undefined,
          sort: parsedExtras?.genre
            ? FilmSortSchema.optional().parse(parsedExtras.genre)
            : undefined,
        })
      );

      if (!sourceDataErr && sourceData.length > 0) {
        c.var.logger.info(
          `Fetched ${sourceData.length} items from source ${source.constructor.name}`
        );
        data = sourceData;
        successfulSource = source.constructor.name;
        break;
      }
      c.var.logger.error(
        `Error fetching data from source ${source.constructor.name}: ${sourceDataErr}`
      );
    }

    if (!successfulSource) {
      c.var.logger.error(`All sources failed for config ${encodedConfig}`);
      return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
    }

    c.var.logger.info(
      `Using data from source ${successfulSource} for config ${encodedConfig}`
    );

    if (c.var.config.url.includes("/by/shuffle/")) {
      // if we are shuffling, get the seed from the database if it exists
      c.var.logger.info(`Shuffling films for ${c.var.config.url}`);
      let seedRecord = await prisma.shuffleSeed.findFirst({
        where: {
          configId: cached.id,
        },
      });

      if (seedRecord) {
        c.var.logger.info(
          `Found shuffle seed for ${c.var.config.url}: ${JSON.stringify(seedRecord, null, 2)}`
        );
      }

      // if expired or not found, create a new seed
      const ONE_HOUR = 60 * 60 * 1000;
      if (
        !seedRecord ||
        Date.now() - seedRecord.updatedAt.getTime() > ONE_HOUR
      ) {
        // create a new seed
        c.var.logger.info(
          `No shuffle seed found or stale for ${c.var.config.url}, creating a new one with configId: ${cached.id}`
        );
        const newSeed = Math.random() * 1000000;
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
      data = seededShuffle(data);
    }

    // pagination
    const start = parsedExtras?.skip ? Number(parsedExtras.skip) : 0;
    let end = start + serverEnv.CATALOG_PAGE_SIZE;
    if (end >= data.length) {
      end = data.length;
    }
    const paginatedCachedFilms = data.slice(start, end);

    const metas: MetaDetail[] = paginatedCachedFilms.map((film) => {
      const poster = (() => {
        const cachedConfigFilmMetadata = data.find(
          (item) => item.id === film.id
        );

        if (!cachedConfigFilmMetadata) {
          c.var.logger.error(`No cached metadata found for film ID ${film.id}`);
          return "";
        }

        if (c.var.config.posterChoice === "letterboxd") {
          if (successfulSource === "LetterboxdSource") {
            const filmPoster = paginatedCachedFilms.find(
              (f) => f.id === film.id
            )?.poster;

            if (filmPoster) {
              return filmPoster;
            }
          }

          return `${c.var.config.origin}/api/poster/${film.id}`;
        }

        if (c.var.config.posterChoice === "letterboxd-custom-from-list") {
          if (successfulSource === "LetterboxdSource") {
            const filmPoster = paginatedCachedFilms.find(
              (f) => f.id === film.id
            )?.poster;

            if (filmPoster) {
              return filmPoster;
            }
          }

          const altId = data.find((item) => item.id === film.id)?.altPoster;
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

        c.var.logger.error({ config: c.var.config, film });
        c.var.logger.error(`!!! No poster found for film ID ${film.id}`);
        return "";
      })();

      return {
        id: film.imdb ?? `letterboxd:${film.id}`,
        type: "movie",
        name: film.name,
        description: film.description ?? undefined,
        cast: film.cast,
        director: film.director,
        // NOTE: change this as it will just be the ids
        genres: film.genres,
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
