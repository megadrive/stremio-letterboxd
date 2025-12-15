import { createRouter, type AppBindingsWithConfig } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";
import { prisma } from "@stremio-addon/database";
import type { Context } from "hono";
import { serverEnv } from "@stremio-addon/env";
import { createShuffle } from "fast-shuffle";
import { to } from "await-to-js";

import type { SourceResult, ISource } from "@/sources/ISource.js";
import { CacheSource } from "@/sources/CacheSource.js";
import { LetterboxdSource } from "@/sources/Letterboxd.js";
import { StremthruSource } from "@/sources/Stremthru.js";
import { FilmSortSchema } from "@/sources/Letterboxd.types.js";
import { z } from "zod";
import { FullLetterboxdMetadataSchema } from "@/lib/consts.js";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";

// Prioritise the sources based on env
const SourceList: { name: string; source: ISource }[] = [
  { name: "stremthru", source: new StremthruSource() },
  { name: "letterboxd", source: new LetterboxdSource() },
  { name: "cache", source: new CacheSource() },
];
// default: "stremthru,letterboxd,cache"
const SOURCES = serverEnv.SOURCE_PRIORITY.split(",")
  .map((name) => SourceList.find((s) => s.name === name)?.source)
  .filter((e) => !!e);
logger.info(`Source order: ${serverEnv.SOURCE_PRIORITY}`);

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

    const sort = ((): z.infer<typeof FilmSortSchema> | undefined => {
      const typesOfSort = new Map<string, z.infer<typeof FilmSortSchema>>([
        ["", "AverageRatingHighToLow"], // default
        ["reverse", "MemberRatingLowToHigh"],
        ["name", "FilmName"],
        ["popular", "FilmPopularity"],
        ["popular-this-month", "FilmPopularityThisMonth"],
        ["popular-this-week", "FilmPopularityThisWeek"],
        ["popular-this-year", "FilmPopularityThisYear"],
        ["shuffle", "Shuffle"],
        ["added", "Added"],
        ["release", "ReleaseDateLatestFirst"],
        ["release-earliest", "ReleaseDateEarliestFirst"],
        ["rating", "AverageRatingHighToLow"],
        ["rating-lowest", "AverageRatingLowToHigh"],
        ["owner-rating", "OwnerRatingHighToLow"],
        ["owner-rating-lowest", "OwnerRatingLowToHigh"],
        ["shortest", "FilmDurationShortestFirst"],
        ["longest", "FilmDurationLongestFirst"],
        ["date", "DateLatestFirst"],
        ["date-earliest", "DateEarliestFirst"],
      ]);

      // /almosteffective/watchlist/by/shuffle/
      let howToSort = c.var.config.url.split("/by/")[1];
      if (howToSort) {
        // remove trailing slashes
        howToSort = howToSort.trim().replace(/\/+$/, "");
      }
      if (!howToSort) {
        return undefined;
      }

      if (howToSort === "") {
        return "AverageRatingHighToLow";
      }

      return typesOfSort.get(howToSort) ?? undefined;
    })();

    let data: SourceResult[] = [];
    let successfulSource: string | undefined = undefined;
    for (const source of SOURCES) {
      const [sourceDataErr, sourceData] = await to(
        source.fetch({
          url: c.var.config.url,
          config: c.var.config,
          configString: c.var.configString,
          skip: parsedExtras?.skip ? Number(parsedExtras.skip) : undefined,
          sort,
        })
      );

      if (!sourceData) {
        c.var.logger.error(
          `No data returned from source ${source.constructor.name}`
        );
        continue;
      }

      const { shouldStop, metas } = sourceData;

      if (!sourceDataErr && metas.length > 0) {
        c.var.logger.info(
          `Fetched ${metas.length} items from source ${source.constructor.name}`
        );
        data = metas;
        successfulSource = source.constructor.name;
        break;
      }
      c.var.logger.error(
        `Error fetching data from source ${source.constructor.name}: ${sourceDataErr}`
      );
      if (shouldStop) {
        c.var.logger.info(
          `Source ${source.constructor.name} indicated to stop further fetching.`
        );
        break;
      }
    }

    if (!successfulSource) {
      c.var.logger.error(`All sources failed for config ${encodedConfig}`);
      return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
    }

    c.var.logger.info(
      `Using data from source ${successfulSource} for config ${encodedConfig}`
    );

    // shuffle
    if (sort === "Shuffle") {
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
    // only paginate if not from Letterboxd source, as that is already paginated
    const paginatedCachedFilms =
      successfulSource !== "LetterboxdSource" ? data.slice(start, end) : data;

    //** Fetch full metadata if configured
    const shouldFetchFullMetadata =
      serverEnv.METADATA_LEVEL === "full" || c.var.config.fullMetadata;

    let fullMetadata:
      | z.SafeParseSuccess<{
          data: z.infer<typeof FullLetterboxdMetadataSchema>;
        }>
      | z.SafeParseError<{
          data: z.infer<typeof FullLetterboxdMetadataSchema>;
        }>
      | undefined = undefined;

    c.var.logger.info(`Should fetch full metadata? ${shouldFetchFullMetadata}`);
    if (shouldFetchFullMetadata) {
      // fetch full metadata for the paginated films
      const [fullMetadataErr, fullMetadataRes] = await to(
        fetch(
          `${serverEnv.METADATA_PROVIDER_URL}/letterboxd/details/${paginatedCachedFilms.map((film) => film.id.split(":")[1]).join(",")}`
        ).then((res) => res.json())
      );

      if (fullMetadataErr) {
        c.var.logger.warn(
          `Error fetching full metadata from provider: ${fullMetadataErr}`
        );
      }

      fullMetadata = z
        .object({
          data: FullLetterboxdMetadataSchema,
        })
        .safeParse(fullMetadataRes);
      c.var.logger.info(
        `Fetched full metadata from provider? ${fullMetadata.success}`
      );
      if (!fullMetadata.success) {
        c.var.logger.warn(
          `Invalid full metadata received from provider: ${JSON.stringify(
            fullMetadata.error.format(),
            null,
            2
          )}`
        );
      }
    }

    c.var.logger.info(`Preparing final metadata response.`);
    const metas: MetaDetail[] = paginatedCachedFilms.map((film) => {
      const poster = (() => {
        if (successfulSource === "StremthruSource") {
          return film.poster;
        }

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

      // normalise titles, removing year from the end if present
      if (/\(\d{4}\)$/.test(film.name)) {
        film.name = film.name.replace(/\s*\(\d{4}\)$/, "").trim();
      }

      c.var.logger.info(`Preparing metadata for film ID ${film.id}`);
      const meta: MetaDetail & { imdb_id?: string } = {
        id: film.imdb ?? `letterboxd:${film.id}`,
        imdb_id: film.imdb,
        type: "movie",
        name: film.name,
        poster,
      };

      // if we have full metadata, merge it in
      c.var.logger.info(
        `Checking for full metadata merge for film ID ${film.id}`
      );

      if (
        serverEnv.METADATA_LEVEL === "full" &&
        fullMetadata &&
        fullMetadata.success &&
        fullMetadata.data.data.length > 0
      ) {
        c.var.logger.info(`Merging full metadata for film ID ${film.id}`);
        const fullMetaForFilm = fullMetadata.data.data.find(
          (m) => m.lbxd === film.id.split(":")[1]
        );
        c.var.logger.info(
          `Found full metadata for film ID ${film.id}? ${!!fullMetaForFilm}`
        );
        if (fullMetaForFilm) {
          meta.description = `${fullMetaForFilm.tagline ? fullMetaForFilm.tagline + " - " : ""}${fullMetaForFilm.synopsis}`;
          // override poster only if not already set
          if (!meta.poster) {
            meta.poster = fullMetaForFilm.poster;
          }
          meta.genres = fullMetaForFilm.genres.map((g) => g.trim());
          meta.background = fullMetaForFilm.backdrop;

          meta.director =
            fullMetaForFilm.crew
              .slice(0, 10)
              .filter((c) => c.role === "Director")[0]?.people ?? undefined;
          meta.cast = fullMetaForFilm.cast.slice(0, 10).map((c) => c);

          const cast: MetaDetail["links"] = fullMetaForFilm.cast
            .slice(0, 10)
            .map((c) => ({
              name: c,
              category: "Cast",
              url: `stremio:///search?search=${c}`,
            }));
          const crew: MetaDetail["links"] = [];
          fullMetaForFilm.crew.forEach((c) => {
            const RolesToInclude = ["Director", "Writers"];
            if (!RolesToInclude.includes(c.role)) {
              return;
            }

            c.people.forEach((p) => {
              crew.push({
                name: p,
                category: `${c.role}${c.role.endsWith("s") ? "" : "s"}`,
                url: `stremio:///search?search=${p}`,
              });
            });
          });
          meta.links = [...cast, ...crew];
        }
      }

      return meta;
    });

    c.header("Cache-Control", "public, max-age=3600");

    // Serve some additional headers to assist with debugging/source tracking
    c.header("X-Source-Used", successfulSource);
    c.header("X-Metadata-Level", shouldFetchFullMetadata ? "full" : "basic");
    return c.json({ metas });
  } catch (error) {
    c.var.logger.error(error);
  }

  return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
}

catalogRouter.get("/:type/:id", handleCatalogRoute);
catalogRouter.get("/:type/:id/:extras.json", handleCatalogRoute);
