import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import {
  createAPIRouter,
  type AppBindingsWithConfig,
} from "@/util/createHono.js";
import { prisma } from "@stremio-addon/database";
import { to } from "await-to-js";
import type { Context } from "hono";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "stoker/http-status-codes";
import { z } from "zod";

const POSTER_TTL = 1000 * 60 * 60 * 24 * 7; // 1 week

/** Fetch a Letterboxd poster on demand and cache. */
export const posterAPIRouter = createAPIRouter();

const cacheBuster = () => {
  const dict = "abcdefghijklmnopqrstuvwxyz0123456789_";
  return Array.from({ length: 8 })
    .map(() => dict[Math.floor(Math.random() * dict.length)])
    .join("");
};

async function fetchPoster(
  slug: string,
  altId?: string
): Promise<string | undefined> {
  const POSTER_URL = `https://letterboxd.com/film/${slug}/poster/std${altId ? `/${altId}` : "/125"}/?k=${cacheBuster()}`;
  logger.warn(`Fetching poster from ${POSTER_URL}`);

  const shape = z.object({
    url: z.string().url(),
    url2x: z.string().url(),
  });

  const [resErr, res] = await to(fetch(POSTER_URL));
  if (resErr || !res.ok) {
    logger.error(
      `Error fetching poster for ${slug}: ${res?.status} - ${res?.statusText}`
    );
    if (resErr) {
      logger.error(resErr);
    }
    return;
  }

  const json = await res.json();

  const parsed = shape.safeParse(json);
  if (!parsed.success) {
    logger.error(`Error parsing poster JSON for ${slug}:`);
    logger.error(parsed.error);
    return;
  }

  // try to get the largest image possible
  const href = parsed.data.url2x ?? parsed.data.url;

  return href;
}

async function handleRoute(c: Context<AppBindingsWithConfig>) {
  const { slug, altId } = c.req.param();

  c.var.logger.debug(`Fetching poster for ${slug}`);
  try {
    // use cached if available
    const cached = await prisma.poster.findFirst({
      where: { filmId: slug, altId: +altId },
    });
    if (cached && cached.updatedAt > new Date(Date.now() - POSTER_TTL)) {
      c.var.logger.debug(`Using cached poster for ${slug}`);
      return c.redirect(cached.poster);
    }

    const href = await fetchPoster(slug, altId);

    if (!href) {
      return c.text("", NOT_FOUND);
    }

    // cache in the background
    if (!cached) {
      prisma.poster
        .create({
          data: {
            poster: href,
            filmId: slug,
            altId: +altId,
          },
        })
        .then(() => {
          c.var.logger.debug(`Cached poster for ${slug}:${altId} created`);
        })
        .catch((error) => {
          c.var.logger.error(`Failed to cache poster for ${slug}:${altId}`);
          c.var.logger.error(error);
        });
    } else {
      prisma.poster
        .update({
          where: {
            id: cached?.id,
          },
          data: {
            poster: href,
            altId: +altId,
          },
        })
        .then(() => {
          c.var.logger.debug(`Cached poster for ${slug}:${altId} updated`);
        })
        .catch((error) => {
          c.var.logger.error(`Failed to cache poster for ${slug}:${altId}`);
          c.var.logger.error(error);
        });
    }

    return c.redirect(href);
    // return c.redirect(href);
  } catch (error) {
    logger.error(`Couldn't fetch poster for ${slug}`);
    logger.error(error);
  }

  return c.text("", INTERNAL_SERVER_ERROR);
}

posterAPIRouter.get("/:slug", handleRoute);
posterAPIRouter.get("/:slug/:altId", handleRoute);
