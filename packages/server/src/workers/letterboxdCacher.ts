import { serverEnv } from "@stremio-addon/env";
import PQueue from "p-queue";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { load as cheerio } from "cheerio";
import { wrappedFetch } from "@/util/wrappedFetch.js";
import { z } from "zod";
import { FETCH_FAILED, SCRAPE_FAILED } from "@/lib/errors.js";
import { prisma } from "@stremio-addon/database";
import { config, type Config } from "@stremio-addon/config";

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
      const url = userConfig.url;
      const html = await fetchHtml(url);
      const $ = cheerio(html);

      // scrape the list to cache for the user

      const catalogName =
        userConfig.catalogName ?? (await determineCatalogName({ url, $ }));
      const initialMeta: BasicMetadata[] = [];

      const foundPages = +$("paginate-pages").last().text();
      // TODO refactor this later
      let pages = (() => {
        if (foundPages > 10) return 10;
        if (foundPages < 1) return 1;
      })();
      if (new URL(url).pathname.includes("/films")) {
        pages = 2;
      }
      logger.info(`Found ${pages} pages`);

      for (let i = 1; i <= pages; i++) {
        const url = `${userConfig.url}${!userConfig.url.endsWith("/") ? "/" : ""}page/${i}/`;
        logger.error(`Scraping page ${i} of ${pages} in ${url}`);
        const html = await fetchHtml(url);
        const $ = cheerio(html);

        const meta = await scrapePostersForMetadata($);

        initialMeta.push(...meta);
      }

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
      const slugs = initialMeta.map((m) => m.id);
      scrapeIDsFromFilmPage(slugs).then(() => {
        logger.info(`Successfully cached IDs for ${catalogName}`);
      });

      return initialMeta;
    } catch (error) {
      logger.error(error);
    }
  }
}

async function scrapeIDsFromFilmPage(slugs: string[]) {
  const idQueue = new PQueue({ concurrency: 3 });
  for (const slug of slugs) {
    idQueue.add(async () => {
      const url = `https://letterboxd.com/film/${slug}/`;
      const html = await fetchHtml(url);
      const $ = cheerio(html);

      //<a href="http://www.imdb.com/title/tt31806037/maindetails" class="micro-button track-event" data-track-action="IMDb" target="_blank">IMDb</a>`
      const imdbHref = $("a[data-track-action='IMDb']").attr("href");
      const imdb = imdbHref?.match(/tt\d+/)?.[0];
      const tmdbHref = $("a[data-track-action='TMDB']").attr("href");
      const tmdb = tmdbHref?.match(/\/\d+$/)?.[0]?.slice(1);

      // cache to db
      try {
        await prisma.film.update({
          where: { id: slug },
          data: { imdb, tmdb },
        });
      } catch {
        // don't care lol
      }
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
  const res = await resolveFinalUrl(url);
  if (!res) {
    throw { ...SCRAPE_FAILED, message: "Failed to resolve final URL." };
  }

  const urlToScrape = await determineStrategy(res.url);

  try {
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
  let $posters = $(".film-poster");
  logger.info(`Found ${$posters.length} posters`);

  if ($posters.length === 0) {
    $posters = $(".poster");
  }

  const metadata: (BasicMetadata & { poster?: string })[] = [];

  const InterimBasicMetadataSchema = z.object({
    id: z.string(),
    name: z.string(),
    altPoster: z.coerce.string().optional(),
  });

  $posters.each(function () {
    const $el = $(this);

    const filmSlug = $el.data("filmSlug");
    const altPosterId = $el.data("altPoster");
    const name = $el.find("img").first().prop("alt");

    logger.debug({ filmSlug, altPosterId, name });

    const parsedMetadata = InterimBasicMetadataSchema.parse({
      id: filmSlug,
      name,
      altPoster: altPosterId,
    });

    metadata.push({ ...parsedMetadata, poster: "" });
  });

  logger.info(`Scraped metadata for ${metadata.length} films`);

  return metadata;
}

export const letterboxdCacher = new LetterboxdCacher();
