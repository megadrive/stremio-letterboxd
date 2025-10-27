import { createRouter } from "@/util/createHono.js";
import { getError } from "@/util/errors.js";
import { createCache } from "@/lib/sqliteCache.js";
import { to } from "await-to-js";
import { z } from "zod";
import { PERMANENT_REDIRECT } from "stoker/http-status-codes";
import { pinoLoggerStandalone } from "@/lib/pinoLogger.js";

type LbxdMeta = {
  lbxd: string;
  imdb?: string;
  tmdb?: string;
};
const cache = createCache<LbxdMeta>("lbxd-id", 1000 * 60 * 60 * 24); // 1 day cache

// should match: /:config/meta/:type/:id/:extras?.json
// ex: /configexample/meta/movie/123456.json
export const metaRouter = createRouter();
const tmdbInstanceUrl = `https://94c8cb9f702d-tmdb-addon.baby-beamup.club`;
const cinemetaInstance = `https://v3-cinemeta.strem.io`;

/** Fetch a JSON response from a URL */
async function fetchJsonResponse(url: string) {
  const [err, res] = await to(fetch(url));
  if (err) {
    throw new Error(`Error fetching ${url}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();

  // ensure it is a json object
  if (typeof json !== "object" || json === null) {
    throw new Error(`Invalid JSON response from ${url}`);
  }

  return json;
}

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
  pinoLoggerStandalone.debug(
    `Resolving ${type} ${opts[type]} to Letterboxd ID`
  );
  const [fetchedErr, fetchedLid] = await to(
    fetch(
      `https://lbxd-id.almosteffective.com/letterboxd/${type}/${opts[type]}`
    )
  );

  pinoLoggerStandalone.debug(
    `Fetched Letterboxd ID for ${type} ${opts[type]}: ${fetchedLid?.status}`
  );

  if (fetchedErr || !fetchedLid?.ok) {
    pinoLoggerStandalone.error(
      `Error fetching Letterboxd ID for ${type} ${opts[type]}: ${fetchedErr?.message}`
    );
    throw new Error("Error fetching Letterboxd ID");
  }

  const json = await fetchedLid.json();
  // resolve json
  const parsedInfo = z
    .array(
      z.object({
        slug: z.string(),
        lbxd: z.string(),
        tmdb: z.coerce.string(),
        imdb: z.string().optional(),
      })
    )
    .safeParse(json);

  if (!parsedInfo.success) {
    pinoLoggerStandalone.error(
      `Error parsing Letterboxd ID response for ${type} ${opts[type]}: ${parsedInfo.error.message}`
    );
    console.warn({ json });
    throw new Error("Error parsing Letterboxd ID response");
  }

  const resolvedInfo = parsedInfo.data;

  pinoLoggerStandalone.debug(
    `Resolved ${type} ${opts[type]} to Letterboxd ID ${resolvedInfo[0].lbxd}`
  );

  if (resolvedInfo.length === 0) {
    throw new Error("No data found for the provided Letterboxd identifier");
  }

  const { lbxd, imdb, tmdb } = resolvedInfo[0];

  const rv: LbxdMeta = {
    lbxd,
    imdb,
    tmdb,
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

  // resolve slug to letterboxdId
  const [resolveErr, resolved] = await to(resolve({ id: lbxd, slug }));

  if (resolveErr) {
    c.var.logger.error("Error resolving Letterboxd slug", resolveErr);
    return c.text("Error resolving Letterboxd slug", 500);
  }

  const CACHE = `max-age=2592000`; // Cache for 30 days
  if (resolved.imdb) {
    const imdbRes = await fetchJsonResponse(
      `${cinemetaInstance}/meta/${type}/${resolved.imdb}.json`
    );

    c.header("Cache-Control", CACHE);
    return c.json(imdbRes);
  }

  if (resolved.tmdb) {
    const tmdbRs = await fetchJsonResponse(
      `${tmdbInstanceUrl}/meta/${type}/tmdb:${resolved.tmdb}.json`
    );

    c.header("Cache-Control", CACHE);
    return c.json(tmdbRs);
  }

  return c.text(`Error fetching metadata for ${id}`, 500);
});
