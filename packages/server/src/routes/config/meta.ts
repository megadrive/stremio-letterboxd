import { tmdb } from "@/lib/tmdb.js";
import { createRouter } from "@/util/createHono.js";
import { getError } from "@/util/errors.js";
import { prisma } from "@stremio-addon/database";
import type { MetaDetail } from "stremio-addon-sdk";

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = createRouter();

metaRouter.get("/:type/:id.json", async (c) => {
  // redirect to tmdb-addon endpoint
  const { type } = c.req.param();
  let { "id.json": id } = c.req.param();

  // just in case, early exit if not a valid idPrefix
  if (!id.startsWith("letterboxd:")) {
    return c.text("Invalid idPrefix", 404);
  }

  id = id.replace(/\.json$/, "");

  const [, idWithoutPrefix, errorCode] = id.split(":");

  c.var.logger.debug(`meta ${type} ${idWithoutPrefix}`);

  // handle error metas
  if (idWithoutPrefix === "error") {
    return c.json({ meta: getError(errorCode, c.var.config) });
  }

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
        const tmdbMeta = await tmdb().getMovieDetails(+cached.tmdb);

        const meta: MetaDetail = {
          id: `tmdb:${tmdbMeta.id}`,
          type: "movie",
          name: tmdbMeta.title,
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
