import { createRouter } from "@/util/createHono.js";
import type { MetaDetail } from "stremio-addon-sdk";
import { parseExtras } from "@/util/parseExtras.js";
import { letterboxdScraper } from "@/lib/letterboxd/scraper.js";
import { INTERNAL_SERVER_ERROR } from "stoker/http-status-codes";

export const catalogRouter = createRouter();

catalogRouter.get("/:type/:id.json", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");
  const extras = c.req.param("extras");

  const parsedExtras = parseExtras(extras);
  console.info(`[${type}] ${id} with extras: ${JSON.stringify(parsedExtras)}`);

  const config = c.var.config;
  const { url } = config;
  const letterboxdMetadata = await letterboxdScraper(url);

  if (!letterboxdMetadata) {
    c.var.logger.error("Failed to scrape letterboxd metadata");
    return c.json({ metas: [] }, INTERNAL_SERVER_ERROR);
  }

  let { metadata } = letterboxdMetadata;

  // change posters if needed
  if (config.posterChoice !== "letterboxd-custom-from-list") {
    c.var.logger.debug(`Changing posters to ${config.posterChoice}`);
    switch (config.posterChoice) {
      case "cinemeta": {
        metadata = metadata.map((meta) => {
          return {
            ...meta,
            // can only use cinemeta if we have an imdb id
            poster: `${meta.imdbId ? `https://images.metahub.space/poster/small/${meta.imdbId}/img` : meta.poster}`,
          };
        });
        break;
      }
    }
  }

  const metas: MetaDetail[] = metadata.map((meta) => {
    return {
      // prefer imdbId, but fallback to tmdbId
      id: meta.imdbId ?? `tmdb:${meta.tmdbId}`,
      imdb_id: meta.imdbId,
      type: "movie",
      name: meta.title,
      poster: meta.poster,
      genres: meta.genres,
      description: meta.description,
      releaseInfo: `${meta.releaseDate}`,
      background: meta.poster,
      director: meta.directors,
      cast: meta.cast,
      runtime: `${meta.runtime} min`,
      year: meta.releaseDate,
    };
  });

  return c.json({ metas });
});
