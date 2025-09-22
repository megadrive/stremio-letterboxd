import { tmdb } from "@/lib/tmdb.js";
import { createRouter } from "@/util/createHono.js";
import { getError } from "@/util/errors.js";
import { prisma } from "@stremio-addon/database";
import type { MetaDetail } from "stremio-addon-sdk";
import { LetterboxdSource } from "@/sources/Letterboxd.js";
const letterboxdSource = new LetterboxdSource();

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = createRouter();
const tmdbInstanceUrl = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club`;

metaRouter.get("/:type/:id.json", async (c) => {
  // redirect to tmdb-addon endpoint
  const { type } = c.req.param();
  let { "id.json": id } = c.req.param();

  // just in case, early exit if not a valid idPrefix
  if (!id.startsWith("letterboxd:")) {
    return c.text("Invalid idPrefix", 404);
  }

  id = id.replace(/\.json$/, "");

  // letterboxd:[id-]slugOrLid
  const [, idWithoutPrefix, errorCode] = id.split(":");

  c.var.logger.debug(`meta ${type} ${idWithoutPrefix}`);

  // handle error metas
  if (idWithoutPrefix === "error") {
    return c.json({ meta: getError(errorCode, c.var.config) });
  }

  try {
    let lid: string | null = idWithoutPrefix.split("-")[1];
    if (!lid) {
      lid = await letterboxdSource.getLetterboxdID(`/film/${idWithoutPrefix}`);
    }

    if (!lid) {
      c.var.logger.error(`Failed to find Letterboxd ID for ${idWithoutPrefix}`);
      return c.text("Error fetching meta data", 500);
    }

    const lbxdMeta = await letterboxdSource.getFilm(lid);
    if (lbxdMeta) {
      c.var.logger.info("Found Letterboxd meta", lbxdMeta);

      const ids = {
        tmdb: lbxdMeta.links?.find((link) => link.type === "tmdb")?.id,
        imdb: lbxdMeta.links?.find((link) => link.type === "imdb")?.id,
      };

      if (!ids.imdb && ids.tmdb) {
        return c.redirect(
          `${tmdbInstanceUrl}/meta/${type}/tmdb:${ids.tmdb}.json`
        );
      }

      if (ids.imdb) {
        return c.redirect(
          `https://v3-cinemeta.strem.io/meta/${type}/${ids.imdb}.json`
        );
      }
    }

    // find the config in the database
    const cached = await prisma.film.findFirst({
      where: {
        id: idWithoutPrefix,
      },
    });

    if (!cached) {
      c.var.logger.error(
        `Failed to find cached metadata for ${idWithoutPrefix}`
      );
      return c.text("Error fetching meta data", 500);
    }

    // check if it's available
    const tmdbUrl = `${tmdbInstanceUrl}/meta/${type}/tmdb:${cached.tmdb}.json`;
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
