import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import {
  createAPIRouter,
  type AppBindingsWithConfig,
} from "@/util/createHono.js";
import { prisma } from "@stremio-addon/database";
import { load as cheerio } from "cheerio";
import type { Context } from "hono";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "stoker/http-status-codes";

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
  const POSTER_URL = `https://letterboxd.com/ajax/poster/film/${slug}/std/${altId ? `${altId}/` : ""}230x345/?k=${cacheBuster()}`;

  let html;
  try {
    const res = await fetch(POSTER_URL);
    if (!res.ok) {
      return;
    }
    html = await res.text();
  } catch (error) {
    logger.error(`Error fetching poster for ${slug}`);
    logger.error(error);
    return;
  }

  const $ = cheerio(html);

  const href = $("img").first().prop("srcset");

  if (!href) {
    return;
  }

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
    c.var.logger.debug({ href, slug, altId });
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
