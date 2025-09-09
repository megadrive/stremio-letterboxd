import { serverEnv } from "@stremio-addon/env";
import PQueue from "p-queue";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { load as cheerio } from "cheerio";
import { wrappedFetch } from "@/util/wrappedFetch.js";
import { z } from "zod";
import { FETCH_FAILED, SCRAPE_FAILED } from "@/lib/errors.js";
import { prisma } from "@stremio-addon/database";
import { config, type Config } from "@stremio-addon/config";
import { to } from "await-to-js";

// gets cached in each user's database
export const BasicMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  poster: z.string(),
  altPoster: z.string().optional(),
});
export type BasicMetadata = z.infer<typeof BasicMetadataSchema>;
export const FullMetadataSchema = BasicMetadataSchema.merge(
  z.object({
    imdbId: z.string().optional(),
    tmdbId: z.string(),
  })
);
export type FullMetadata = z.infer<typeof FullMetadataSchema>;
export const CatalogMetadataSchema = z.object({
  name: z.string(),
  items: z.array(FullMetadataSchema).or(z.array(BasicMetadataSchema)),
});
export type CatalogMetadata = z.infer<typeof CatalogMetadataSchema>;

/** Using p-queue, caches Letterboxd relevant data. */
export class LetterboxdCacher {
  listQueue: PQueue;

  constructor() {
    this.listQueue = new PQueue({ concurrency: serverEnv.QUEUE_CONCURRENCY });
  }

  addList(userConfig: Config) {
    this.listQueue.add(() => this.scrapeList(userConfig));
  }

  /**
   * Scrapes for metadata from a Letterboxd list.
   * @param url URL to a Letterboxd page
   * @returns
   */
  /* scrape a list directly */ async scrapeList(
    userConfig: Config
  ): Promise<BasicMetadata[] | undefined> {
    /*
      - Scrape the initial HTML of a given URL
      - Scrape the .poster $cheerio elements for initial metadata
      - Fetch metadata for each film from the data endpoint
     */
    /*
    <div class="really-lazy-load poster film-poster
      film-poster-731222 linked-film-poster"
      data-image-width="125" data-image-height="187"
      data-type="film" data-film-id="731222" data-item-id="film:731222"
      data-film-slug="bottoms" data-poster-url="/film/bottoms/image-150/"
      data-linked="linked"
      data-production-data-endpoint="/film/bottoms/json/"
      data-alt-poster="398196"
    />
    */
    try {
      const encodedConfig = await config.encode(userConfig);
      let url = userConfig.url;
      // if it's a shuffle, just grab the films as usual. we will do our own shuffling later
      if (url.includes("/by/shuffle/")) {
        url = url.replace(/\/by\/shuffle\/.*$/, "/");
      }
      const html = await fetchHtml(url);
      const $ = cheerio(html);

      // scrape the list to cache for the user

      const catalogName =
        userConfig.catalogName ?? (await determineCatalogName({ url, $ }));
      const initialMeta: BasicMetadata[] = [];

      const foundPages = +$(".paginate-page").last().text();
      // TODO refactor this later
      // min-max 1 to 10
      let pages = Math.min(Math.max(1, foundPages), 10);
      if (new URL(url).pathname.startsWith("/films")) {
        // 72 * 10 = 720
        pages = 10;
      }
      logger.info(`Found ${pages} pages`);

      for (let i = 1; i <= pages; i++) {
        const url = `${userConfig.url}${!userConfig.url.endsWith("/") ? "/" : ""}page/${i}/`;
        logger.info(`Scraping page ${i} of ${pages} in ${url}`);
        const html = await fetchHtml(url);
        const $ = cheerio(html);

        const meta = await scrapePostersForMetadata($);

        initialMeta.push(...meta);
      }

      logger.debug(`Found ${initialMeta.length} posters`);

      // Cache catalog metadata
      const userCache: CatalogMetadata = {
        name: catalogName,
        items: initialMeta,
      };

      logger.info(`Caching metadata for ${catalogName}`);

      try {
        const newConfig = await prisma.config.upsert({
          where: { config: encodedConfig },
          create: {
            config: encodedConfig,
            metadata: JSON.stringify(userCache),
          },
          update: {
            metadata: JSON.stringify(userCache),
          },
        });

        logger.info(
          `Successfully cached metadata for ${catalogName}. ID: ${newConfig.id}`
        );
      } catch (error) {
        logger.error(`Failed to cache metadata for ${catalogName}`);
        logger.error(error);
      }

      // scrape the IDs from the film pages and cache
      scrapeIDsFromFilmPage(initialMeta)
        .then(() => {
          logger.info(`Successfully cached IDs for ${catalogName}`);
        })
        .catch(logger.error);

      return initialMeta;
    } catch (error) {
      logger.error(error);
    }
  }
}

async function scrapeIDsFromFilmPage(initialMeta: BasicMetadata[]) {
  const idQueue = new PQueue({ concurrency: 3 });

  const [cachedIdsErr, cachedIds] = await to(
    prisma.film.findMany({
      where: {
        id: { in: initialMeta.map((meta) => meta.id) },
        AND: {
          updatedAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          },
        },
      },
    })
  );

  if (cachedIdsErr || !cachedIds) {
    logger.error("Failed to fetch cached IDs");
    logger.error(cachedIdsErr);
    return;
  }

  const cachedIdsSet = new Set(cachedIds.map((meta) => meta.id));
  initialMeta = initialMeta.filter((meta) => !cachedIdsSet.has(meta.id));
  logger.info(`Found ${cachedIds.length} cached IDs`);
  logger.info(`Found ${initialMeta.length} uncached or stale IDs`);
  if (initialMeta.length === 0) {
    logger.info("No uncached IDs found");
    return;
  }

  for (const meta of initialMeta) {
    idQueue.add(async () => {
      const url = `https://letterboxd.com/film/${meta.id}/`;
      const [htmlErr, html] = await to(fetchHtml(url));
      if (htmlErr || !html) {
        logger.error(`Failed to fetch HTML for ${meta.id}`);
        logger.error(htmlErr);
        return;
      }
      const $ = cheerio(html);

      //<a href="http://www.imdb.com/title/tt31806037/maindetails" class="micro-button track-event" data-track-action="IMDb" target="_blank">IMDb</a>`
      const imdbHref = $("a[data-track-action='IMDb']").prop("href");
      const imdb = imdbHref?.match(/tt\d+/)?.[0];
      const tmdbHref = $("a[data-track-action='TMDB']").prop("href");
      const tmdb = tmdbHref?.match(/\d+/)?.[0];

      if (!tmdb) {
        logger.error(`Couldn't find IDs for ${meta.id}`);
        logger.error({ imdb, tmdb });
        return;
      }

      // get other data from the page
      const tagline = $(".tagline").text();
      const description = $(".tagline").siblings("div.truncate").text().trim();
      const cast = $(".cast-list a")
        .map((_, el) => $(el).text())
        .splice(0, 3);
      const releaseyear = $(".releaseyear").text();
      const directors = $("#tab-crew a[href^='/director']")
        .map((_, el) => $(el).text())
        .splice(0, 3);
      const genres = $("#tab-genres a[href^='/films/genre']")
        .map((_, el) => $(el).text())
        .splice(0, 3);

      // cache to db
      try {
        logger.info(`Caching IDs for ${meta.id}`);

        await prisma.film.upsert({
          where: { id: meta.id },
          create: {
            id: meta.id,
            title: meta.name,
            director: JSON.stringify(directors),
            cast: JSON.stringify(cast),
            description: `${tagline.toUpperCase()} - ${description}`,
            genres: JSON.stringify(genres),
            year: releaseyear ? +releaseyear : undefined,
            tmdb,
            imdb,
          },
          update: { imdb, tmdb },
        });
      } catch (error) {
        logger.error(`Couldn't update film ${meta.id} with IDs, ${error}`);
      }

      logger.info(`Cached IDs for ${meta.id}`);
    });
  }
}

/**
 * Determine the catalog name from either a Cheerio instance or a URL
 */
export async function determineCatalogName(opts: {
  url?: string;
  $?: ReturnType<typeof cheerio>;
}): Promise<string> {
  try {
    const { url } = opts;
    let { $ } = opts;

    if (!url && !$) {
      throw new Error("Either url or $ must be provided");
    }

    if (!$) {
      const html = await fetchHtml(url!);
      $ = cheerio(html);
    }

    // <meta property="og:title" content="severance in some other forms" />
    const catalogName = $("meta[property='og:title']").attr("content");
    if (!catalogName) {
      throw new Error();
    }

    return catalogName;
  } catch (error) {
    logger.error("Failed to determine catalog name");
    logger.error(error);
  }

  return "Catalog name not found";
}

async function resolveFinalUrl(
  url: string
): Promise<ReturnType<typeof wrappedFetch> | undefined> {
  try {
    const res = await wrappedFetch(url, {
      redirect: "follow",
    });

    if (!res.ok) {
      throw { ...FETCH_FAILED, status: res.status };
    }

    return res;
  } catch (error) {
    logger.error(error);
  }
}

type FetchStrategy = "prepend_ajax";
async function determineStrategy(url: string): Promise<string> {
  const urls: Record<`/${string}`, FetchStrategy> = {
    "/films": "prepend_ajax",
  };

  const { origin } = new URL(url);
  const remainingUrl = url.slice(origin.length);

  const urlPath = new URL(url).pathname;
  for (const [path, strategy] of Object.entries(urls)) {
    logger.debug(`Checking ${path} against ${urlPath}`);
    if (urlPath.startsWith(path)) {
      switch (strategy) {
        case "prepend_ajax": {
          logger.debug(`Using prepend_ajax strategy`);
          const [, prepend, ...rest] = remainingUrl.split("/");
          return `${origin}/${prepend}/ajax/${rest.join("/")}`;
        }
        // add more later if necessary
        // case "other_strategy":
        //   return `${origin}/ajax/${strategy}`;
      }
    }
  }

  return url;
}

/**
 * Scrape the initial HTML of a given URL
 */
async function fetchHtml(
  url: string,
  headers?: Record<string, string>
): Promise<string> {
  logger.info(`Scraping HTML from ${url}`);
  try {
    const resFinalUrl = await resolveFinalUrl(url);
    if (!resFinalUrl) {
      throw { ...SCRAPE_FAILED, message: "Failed to resolve final URL." };
    }

    const urlToScrape = await determineStrategy(resFinalUrl.url);

    const res = await wrappedFetch(urlToScrape, { headers });

    if (!res.ok) {
      throw {
        ...FETCH_FAILED,
        message: `Couldn't scrape HTML: ${urlToScrape}`,
      };
    }

    logger.info("Successfully fetched HTML");
    return await res.text();
  } catch (error) {
    logger.error(`Failed to fetch HTML from ${url}`);
    logger.error(error);
  }

  return "";
}

/**
 * Scrape the .poster $cheerio elements for initial metadata
 */
async function scrapePostersForMetadata(
  $: ReturnType<typeof cheerio>
): Promise<BasicMetadata[]> {
  logger.info(`Scraping posters for metadata`);

  const posterSelectors = [".poster", ".film-poster"];

  const $posters = (() => {
    for (const selector of posterSelectors) {
      const posters = $(selector);
      if (posters.length > 0) {
        console.info(
          `Found posters with selector: ${selector}: ${posters.length}`
        );
        return posters;
      }
    }
    return undefined;
  })();

  if (!$posters || $posters.length === 0) {
    logger.warn("No posters found, returning empty metadata array");
    return [];
  }

  const metadata: (BasicMetadata & { poster?: string })[] = [];

  const InterimBasicMetadataSchema = z.object({
    id: z.string(),
    name: z.string(),
    altPoster: z.coerce.string().optional(),
  });

  $posters.each(function () {
    const $el = $(this).parent();

    const filmSlug = $el.data("itemSlug");
    const altPosterId = $el.data("altPoster");
    const name = $el.data("itemName");

    const parsedMetadata = InterimBasicMetadataSchema.parse({
      id: `${filmSlug}`,
      name: `${name}`,
      altPoster: altPosterId,
    });

    metadata.push({ ...parsedMetadata, poster: "" });
  });

  logger.info(`Scraped metadata for ${metadata.length} films`);

  return metadata;
}

export const letterboxdCacher = new LetterboxdCacher();
