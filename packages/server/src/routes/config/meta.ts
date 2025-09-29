import { createRouter } from "@/util/createHono.js";
import { getError } from "@/util/errors.js";
import { LetterboxdSource } from "@/sources/Letterboxd.js";
import { createCache } from "@/lib/sqliteCache.js";

const letterboxdSource = new LetterboxdSource();
const cache = createCache<{
  lid: string;
  imdb?: string;
  tmdb?: string;
}>("lbxd-id", 1000 * 60 * 60 * 24 * 30); // 30 days

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

  /*
  - letterboxd:slug
  - letterboxd:id-lid
  */
  const [, slugOrLid, errorCode] = id.split(":");

  c.var.logger.debug(`meta ${type} ${slugOrLid}`);

  // handle error metas
  if (slugOrLid === "error") {
    return c.json({ meta: getError(errorCode, c.var.config) });
  }

  const cacheKey = slugOrLid;
  const cached = await cache.get(cacheKey);
  if (cached) {
    c.var.logger.info("Found cached Letterboxd ID", cached);

    if (cached.imdb) {
      return c.redirect(
        `https://v3-cinemeta.strem.io/meta/${type}/${cached.imdb}.json`
      );
    }

    if (cached.tmdb) {
      return c.redirect(
        `${tmdbInstanceUrl}/meta/${type}/tmdb:${cached.tmdb}.json`
      );
    }
  }

  try {
    const split = slugOrLid.split("-");
    let lid: string | null = split[0] === "id" ? split[1] : null;
    console.info({ lid, slugOrLid, split: slugOrLid.split("-") });
    if (!lid) {
      lid = await letterboxdSource.getLetterboxdID(`/film/${slugOrLid}`);
    }

    if (!lid) {
      c.var.logger.error(`Failed to find Letterboxd ID for ${slugOrLid}`);
      return c.text("Error fetching meta data", 500);
    }

    const lbxdMeta = await letterboxdSource.getFilm(lid);
    if (lbxdMeta) {
      c.var.logger.info("Found Letterboxd meta", lbxdMeta);

      const ids = {
        tmdb: lbxdMeta.links?.find((link) => link.type === "tmdb")?.id,
        imdb: lbxdMeta.links?.find((link) => link.type === "imdb")?.id,
      };

      console.info("Storing Letterboxd ID mapping in cache", { lid, ...ids });
      await cache.set(cacheKey, { lid, ...ids });

      if (ids.imdb) {
        return c.redirect(
          `https://v3-cinemeta.strem.io/meta/${type}/${ids.imdb}.json`
        );
      }

      if (ids.tmdb) {
        return c.redirect(
          `${tmdbInstanceUrl}/meta/${type}/tmdb:${ids.tmdb}.json`
        );
      }
    }
  } catch (error) {
    c.var.logger.error("Error fetching meta data", error);
  }

  return c.text("Error fetching meta data", 500);
});
