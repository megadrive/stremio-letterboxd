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

export const catalogRouter = createRouter();

async function handleCatalogRoute(c: Context<AppBindingsWithConfig>) {
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
    const cachedFilms = await prisma.film.findMany({
      where: {
        id: {
          in: slugs,
        },
      },
    });

    // order the films in the same order as the slugs
    cachedFilms.sort((a, b) => {
      return slugs.indexOf(a.id) - slugs.indexOf(b.id);
    });

    // pagination
    const start = parsedExtras?.skip ? Number(parsedExtras.skip) : 0;
    let end = start + 100;
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

        if (c.var.config.posterChoice === "letterboxd-ratings") {
          return `https://letterboxd-posters-with-ratings.almosteffective.com/${film.id}`;
        }

        if (film.imdb) {
          if (c.var.config.posterChoice === "rpdb" && c.var.config.rpdbApiKey) {
            return `https://api.ratingposterdb.com/${c.var.config.rpdbApiKey ?? "t0-free-rpdb"}/imdb/poster-default/${film.id}.jpg`;
          }
          return `https://images.metahub.space/poster/small/${film.imdb}/img`;
        }

        return "";
      })();

      return {
        id: film.imdb ?? `letterboxd:${film.id}`,
        type: "movie",
        name: film.title,
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
