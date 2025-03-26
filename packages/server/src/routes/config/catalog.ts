import { createRouter } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";
import { prisma } from "@stremio-addon/database";
import { z } from "zod";
import { CatalogMetadataSchema } from "@/workers/letterboxdCacher.js";
import { serverEnv } from "@stremio-addon/env";

export const catalogRouter = createRouter();

catalogRouter.get("/:type/:id.json", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");
  const extras = c.req.param("extras");

  const parsedExtras = parseExtras(extras);
  console.info(`[${type}] ${id} with extras: ${JSON.stringify(parsedExtras)}`);

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

    // TODO: Add pagination
    const paginatedCachedFilms = cachedFilms.slice();

    const metas: MetaDetail[] = paginatedCachedFilms.map((film) => {
      // parse the genres and director from the JSON string
      const genres = z.array(z.string()).parse(JSON.parse(film.genres));
      const director = z.array(z.string()).parse(JSON.parse(film.director));

      const poster = (() => {
        const cachedConfigFilmMetadata = cachedMetadata.data.items.find(
          (item) => item.id === film.id
        );

        if (!cachedConfigFilmMetadata) {
          return "";
        }

        if (c.var.config.posterChoice === "letterboxd-custom-from-list") {
          return (
            cachedConfigFilmMetadata.altPoster ??
            cachedConfigFilmMetadata.poster
          );
        }

        if (c.var.config.posterChoice === "cinemeta" && film.imdb) {
          return `https://images.metahub.space/poster/small/${film.imdb}/img`;
        }

        if (c.var.config.posterChoice === "letterboxd-ratings") {
          return `https://letterboxd-posters-with-ratings.almosteffective.com/${film.id}`;
        }

        return cachedConfigFilmMetadata.poster;
      })();

      return {
        id: film.imdb ?? `letterboxd:${film.id}`,
        type: "movie",
        name: film.title,
        releaseInfo: `${film.year}`,
        runtime: `${film.runtime} mins`,
        genres,
        director,
        poster,
      };
    });

    c.header("Cache-Control", "public, max-age=3600");
    return c.json({ metas });
  } catch (error) {
    c.var.logger.error(error);
  }

  return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
});
