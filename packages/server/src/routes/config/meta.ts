import { createRouter } from "@/util/createHono.js";
import { wrappedFetch } from "@/util/wrappedFetch.js";
import { prisma } from "@stremio-addon/database";
import type { MetaDetail } from "stremio-addon-sdk";
import { z } from "zod";

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = createRouter();

const TMDBMovieDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z.unknown().nullable(),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(z.unknown()),
  production_countries: z.array(z.unknown()),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(z.unknown()),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

metaRouter.get("/:type/:id.json", async (c) => {
  // redirect to tmdb-addon endpoint
  const { type } = c.req.param();
  let { "id.json": id } = c.req.param();

  // just in case, early exit if not a valid idPrefix
  if (!id.startsWith("letterboxd:")) {
    return c.text("Invalid idPrefix", 404);
  }

  id = id.replace(/\.json$/, "");

  const [, idWithoutPrefix] = id.split(":");

  c.var.logger.debug(`meta ${type} ${idWithoutPrefix}`);

  try {
    const cached = await prisma.film.findFirst({
      where: {
        id: idWithoutPrefix,
      },
    });

    if (!cached) {
      return c.json({ meta: {} }, 404);
    }

    // check if it's available
    const tmdbUrl = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club/meta/${type}/tmdb:${cached.tmdb}.json`;
    const available = await fetch(tmdbUrl);
    if (!available.ok) {
      c.var.logger.info("Not available on TMDB", available.status);

      try {
        const tmdbMetaResponse = await wrappedFetch(tmdbUrl);
        const tmdbMeta = TMDBMovieDetailsSchema.safeParse(tmdbMetaResponse);

        if (!tmdbMeta.success) {
          c.var.logger.error("Error parsing TMDB meta data", tmdbMeta.error);
          return c.json({ meta: {} }, 500);
        }

        const { data } = tmdbMeta;

        const meta: MetaDetail = {
          id: `tmdb:${data.id}`,
          type: "movie",
          name: data.title,
        };

        return c.json({ meta });
      } catch (error) {
        c.var.logger.error("Error fetching meta data", error);
        return c.json({ meta: {} }, 500);
      }
    }

    return c.redirect(tmdbUrl);
  } catch (error) {
    c.var.logger.error("Error fetching meta data", error);
  }

  return c.text("Error fetching meta data", 500);
});
