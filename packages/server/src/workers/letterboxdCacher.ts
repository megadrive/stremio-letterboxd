import { serverEnv } from "@stremio-addon/env";
import PQueue from "p-queue";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { load as cheerio } from "cheerio";
import { wrappedFetch } from "@/util/wrappedFetch.js";
import { z } from "zod";
import { FETCH_FAILED, SCRAPE_FAILED } from "@/lib/errors.js";
import { prisma } from "@stremio-addon/database";
import { config, type Config } from "@stremio-addon/config";

type Slug = string;
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
    description: z.string(),
    cast: z.array(z.string()),
    director: z.array(z.string()),
    genres: z.array(z.string()),
    runtime: z.number(),
    released: z.string(),
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
  async scrapeList(userConfig: Config): Promise<BasicMetadata[] | undefined> {
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
      const html = await scrapeHtml(url);
      const $ = cheerio(html);

      // scrape the list to cache for the user

      const catalogName =
        userConfig.catalogName ?? (await determineCatalogName({ url, $ }));
      const initialMeta = await scrapePostersForMetadata($);

      // Cache catalog metadata
      const userCache: CatalogMetadata = {
        name: catalogName,
        items: initialMeta,
      };

      logger.info(`Caching metadata for ${catalogName}`);

      try {
        const newConfig = await prisma.config.create({
          data: {
            config: encodedConfig,
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

      // fire off the next step, full metadata, in batches of 10
      const fullMetadataQueue = new PQueue({
        concurrency: serverEnv.QUEUE_CONCURRENCY,
      });
      let left = initialMeta.length;
      while (left > 0) {
        let next = 10;
        if (left >= 10) {
          left = left - 10;
        } else {
          next = left;
          left = 0;
        }

        const batch = initialMeta.slice(left, left + next);
        fullMetadataQueue.add(() =>
          fetchFullMetadata(batch.map((meta) => meta.id))
        );
      }

      return initialMeta;
    } catch (error) {
      logger.error(error);
    }
  }
}

async function fetchFullMetadata(slugs: Slug[]) {
  // fetch any cached slugs and only update them if they're over a week old
  const cachedMetadata = await prisma.film.findMany({
    where: {
      id: {
        in: slugs,
      },
    },
  });

  const expiredSlugs = cachedMetadata
    .filter((meta) => {
      const now = new Date();
      const lastUpdated = new Date(meta.updatedAt);
      const diff = now.getTime() - lastUpdated.getTime();
      const diffInDays = diff / (1000 * 3600 * 24);
      return diffInDays > 7;
    })
    .map((meta) => meta.id);

  // also get the slugs that don't exist in the database
  const missingSlugs = slugs.filter((slug) => {
    return !cachedMetadata.find((meta) => meta.id === slug);
  });

  logger.info(
    `Fetching metadata for ${expiredSlugs.length} expired and ${missingSlugs.length} missing slugs`
  );

  const slugsToFetch = [...expiredSlugs, ...missingSlugs];

  for (const slug of slugsToFetch) {
    try {
      const html = await scrapeHtml(`https://letterboxd.com/film/${slug}`);
      const $ = cheerio(html);

      const name = $(".filmtitle").text().trim();
      const released = $(".releaseyear").text().trim();
      const tagline = $(".review>.tagline").text().trim();
      const description = $(".review p").text().trim();
      // 133 mins
      let runtime = 0;
      const $runtime = $(".text-footer")
        .text()
        .trim()
        .match(/^[0-9]+/);
      if ($runtime) {
        runtime = Number.parseInt($runtime[0]);
      }

      const $imdbId = (
        $("a[data-track-action='IMDb']").attr("href") ?? ""
      ).match("tt[0-9]+");
      const imdbId = $imdbId?.length ? $imdbId[0] : undefined;
      const $tmdbId = (
        $("a[data-track-action='TMDB']").attr("href") ?? ""
      ).match(/[0-9]+/);
      const tmdbId = $tmdbId?.length ? $tmdbId[0] : "";
      if (!tmdbId.length) {
        logger.error(`No TMDB ID found for ${slug}`);
        continue;
      }

      const cast =
        $("#tab-cast .text-slug.tooltip")
          .map((_, el) => $(el).text())
          .toArray()
          .slice(0, 4) ?? [];

      const director = $("#tab-crew > div")
        .first()
        .find("a")
        .map((_, el) => {
          return $(el).text().trim();
        })
        .toArray();

      const genres = $("#tab-genres .text-sluglist .text-slug")
        .map(function () {
          if (($(this).prop("href") ?? "").includes("genre")) {
            return $(this).text();
          }
        })
        .toArray()
        .filter((genre) => genre.length);

      // scrapey scrapey
      const toCache: FullMetadata = {
        id: slug,
        name,
        poster: "",
        imdbId,
        tmdbId,
        description: `${tagline ? `${tagline.toUpperCase()} - ` : ""}${description}`,
        cast,
        director,
        genres,
        runtime,
        released,
      };

      const parsedMetadata = FullMetadataSchema.parse(toCache);

      logger.info(`Caching full metadata for ${slug}`);

      try {
        const newMetadata = await prisma.film.upsert({
          create: {
            id: parsedMetadata.id,
            title: parsedMetadata.name,
            imdb: parsedMetadata.imdbId,
            tmdb: parsedMetadata.tmdbId,
            description: parsedMetadata.description,
            cast: JSON.stringify(parsedMetadata.cast),
            director: JSON.stringify(parsedMetadata.director),
            genres: JSON.stringify(parsedMetadata.genres),
            runtime: parsedMetadata.runtime,
            year: +parsedMetadata.released,
          },
          update: {
            title: parsedMetadata.name,
            imdb: parsedMetadata.imdbId,
            tmdb: parsedMetadata.tmdbId,
            description: parsedMetadata.description,
            cast: JSON.stringify(parsedMetadata.cast),
            director: JSON.stringify(parsedMetadata.director),
            genres: JSON.stringify(parsedMetadata.genres),
            runtime: parsedMetadata.runtime,
            year: +parsedMetadata.released,
          },
          where: { id: parsedMetadata.id },
        });

        logger.info(
          `Successfully cached full metadata for ${slug}. ID: ${newMetadata.id}`
        );
      } catch (error) {
        logger.error(`Failed to cache full metadata for ${slug}`);
        logger.error(error);
      }
    } catch (error) {
      logger.error(`Couldn't fetch ${slug}`);
      logger.error(error);
    }
  }
}

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
      const html = await scrapeHtml(url!);
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

  for (const [path, strategy] of Object.entries(urls)) {
    if (url.startsWith(path)) {
      switch (strategy) {
        case "prepend_ajax":
          return `${origin}/ajax/${remainingUrl}`;
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
async function scrapeHtml(url: string): Promise<string> {
  logger.info(`Scraping HTML from ${url}`);
  const res = await resolveFinalUrl(url);
  if (!res) {
    throw { ...SCRAPE_FAILED, message: "Failed to resolve final URL." };
  }

  const urlToScrape = await determineStrategy(res.url);

  try {
    const res = await wrappedFetch(urlToScrape);

    if (!res.ok) {
      throw { ...FETCH_FAILED, message: "Couldn't fetch the poster url" };
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
  const $posters = $(".film-poster");
  logger.info(`Found ${$posters.length} posters`);

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

  logger.info(`Fetching posters for metadata`);
  const metadataWithPosters = await fetchPosters(metadata);

  return metadataWithPosters;
}

function cacheBuster() {
  const dict =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
  return [...Array(8)]
    .map(() => dict[Math.floor(Math.random() * dict.length)])
    .join("");
}

/**
 * Fetch posters for an array of metadata
 */
async function fetchPosters(
  metadata: (BasicMetadata & {
    poster?: string;
  })[]
): Promise<BasicMetadata[]> {
  const metadataWithPosters: BasicMetadata[] = [];

  try {
    for (const meta of metadata) {
      const posterUrl = `https://letterboxd.com/ajax/poster/film/${meta.id}/std/125x187/?k=${cacheBuster()}`;
      const posterHtml = await scrapeHtml(posterUrl);
      const $poster = cheerio(posterHtml);
      const poster = $poster("img").first().attr("src") ?? "";

      let altPoster: string | undefined = undefined;
      logger.debug(`altPoster: ${meta.altPoster}`);
      if (meta.altPoster) {
        logger.info(`Fetching alt poster for ${meta.id}`);
        const altPosterUrl = `https://letterboxd.com/ajax/poster/film/${meta.id}/std/${meta.altPoster}/125x187/?k=${cacheBuster()}`;
        const altPosterHtml = await scrapeHtml(altPosterUrl);
        const $altPoster = cheerio(altPosterHtml);
        altPoster = $altPoster("img").first().attr("src");
      }

      metadataWithPosters.push({ ...meta, poster, altPoster });
    }
  } catch (error) {
    logger.error(error);
  }

  return metadataWithPosters;
}

export const letterboxdCacher = new LetterboxdCacher();
