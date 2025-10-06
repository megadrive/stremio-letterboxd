import { createRouter } from "@/util/createHono.js";
import { getError } from "@/util/errors.js";
import { createCache } from "@/lib/sqliteCache.js";
import { to } from "await-to-js";
import { z } from "zod";

type LbxdMeta = {
  lbxd: string;
  imdb?: string;
  tmdb?: string;
};
const cache = createCache<LbxdMeta>("lbxd-id", 1000 * 60 * 60 * 24 * 30); // 30 days

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = createRouter();
const tmdbInstanceUrl = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club`;
const cinemetaInstance = `https://v3-cinemeta.strem.io`;

// resolves a Letterboxd slug to its Letterboxd ID, TMDB ID, and IMDB ID
async function resolve(
  opts: Partial<{
    slug: string;
    id: string;
  }>
): Promise<LbxdMeta> {
  if (!opts.id && !opts.slug) {
    throw new Error("Either id or slug must be provided");
  }

  const type = opts.id ? "id" : "slug";

  // check cache first
  const cacheKey = `${type}:${opts[type]}`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    return {
      lbxd: cached.lbxd,
      imdb: cached.imdb,
      tmdb: cached.tmdb,
    };
  }

  // if we have a slug, we need to resolve it to a Letterboxd ID first
  const [fetchedErr, fetchedLid] = await to(
    fetch(`https://lbxd-id.up.railway.app/letterboxd/${type}/${opts[type]}`)
  );

  if (fetchedErr || !fetchedLid?.ok) {
    throw new Error("Error fetching Letterboxd ID");
  }

  // resolve json
  const resolvedInfo = z
    .object({
      slug: z.string(),
      lbxd: z.string(),
      tmdb: z.coerce.string(),
      imdb: z.string(),
    })
    .parse(await fetchedLid.json());

  const rv: LbxdMeta = {
    lbxd: resolvedInfo.lbxd,
    imdb: resolvedInfo.imdb,
    tmdb: resolvedInfo.tmdb,
  };

  // cache resolved info
  cache.set(cacheKey, rv);

  return rv;
}

/**
 * Handles requests for metadata based on Letterboxd IDs or slugs.
 * It supports these formats:
 * - letterboxd:slug (e.g., letterboxd:inception-2010)
 * - letterboxd:id:lid (e.g., letterboxd:id:123456)
 * - letterboxd:error:code (e.g., letterboxd:error:404)
 */
metaRouter.get("/:type/:id.json", async (c) => {
  // redirect to tmdb-addon endpoint
  const { type } = c.req.param();
  let { "id.json": id } = c.req.param();
  id = id.replace(/\.json$/, "");

  /*
  - letterboxd:slug
  - letterboxd:id:lid
  */
  const [metaType, slugOrType, lidOrErrorCode] = id.split(":");

  // just in case, early exit if not a valid idPrefix
  if (!metaType || metaType !== "letterboxd") {
    return c.text("Invalid idPrefix", 404);
  }

  let slug: string | undefined;
  let lbxd: string | undefined;

  // handle error metas
  if (slugOrType === "error") {
    return c.json({ meta: getError(lidOrErrorCode, c.var.config) });
  }

  // determine if is a slug or a lbxdId
  if (slugOrType === "id" && lidOrErrorCode) {
    lbxd = lidOrErrorCode;
  } else {
    slug = slugOrType;
  }

  // check cache
  const cacheKey = lbxd ? `id:${lbxd}` : `slug:${slug}`;
  const cached = await cache.get(cacheKey);
  if (cached?.imdb) {
    return c.redirect(`${cinemetaInstance}/meta/${type}/${cached.imdb}.json`);
  }
  if (cached?.tmdb) {
    return c.redirect(
      `${tmdbInstanceUrl}/meta/${type}/tmdb:${cached.tmdb}.json`
    );
  }

  // resolve slug to letterboxdId
  const [resolveErr, resolved] = await to(resolve({ id: lbxd, slug }));

  if (resolveErr) {
    c.var.logger.error("Error resolving Letterboxd slug", resolveErr);
    return c.text("Error resolving Letterboxd slug", 500);
  }

  if (resolved.imdb) {
    return c.redirect(`${cinemetaInstance}/meta/${type}/${resolved.imdb}.json`);
  }

  if (resolved.tmdb) {
    return c.redirect(
      `${tmdbInstanceUrl}/meta/${type}/tmdb:${resolved.tmdb}.json`
    );
  }

  return c.text(`Error fetching metadata for ${id}`, 500);
});
