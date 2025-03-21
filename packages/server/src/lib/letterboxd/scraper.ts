import { wrappedFetch } from "@/util/wrappedFetch.js";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { load as cheerio } from "cheerio";
import { FETCH_FAILED, SCRAPE_FAILED } from "../errors.js";
import { z } from "zod";

export type LetterboxdScraperItem = {
  imdbId?: string;
  /** Will always have a TMDB ID as Letterboxd gets their main data from TMDB. */
  tmdbId: string;
  title: string;
  releaseDate: string | number;
  directors: string[];
  cast: string[];
  genres: string[];
  description: string;
  poster: string;
  runtime: number;
};

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

async function determineStrategy(url: string): Promise<string> {
  const urls: Record<`/${string}`, "ajax"> = {
    "/films": "ajax",
  };

  const { origin } = new URL(url);
  const remainingUrl = url.slice(origin.length);

  for (const [path, strategy] of Object.entries(urls)) {
    if (url.startsWith(path)) {
      switch (strategy) {
        case "ajax":
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
function scrapePostersForMetadata($: ReturnType<typeof cheerio>): {
  filmSlug: string;
  altPosterId?: number;
  dataEndpoint: string;
}[] {
  logger.info(`Scraping posters for metadata`);
  const $posters = $(".poster");
  logger.info(`Found ${$posters.length} posters`);

  const metadata: ReturnType<typeof scrapePostersForMetadata> = [];

  $posters.each((_, el) => {
    const $el = $(el);

    const filmSlug = $el.data("filmSlug");
    const altPosterId = $el.data("altPoster");
    const dataEndpoint = $el.data("productionDataEndpoint");

    if (!filmSlug || !dataEndpoint) {
      return;
    }

    if (
      typeof filmSlug !== "string" ||
      (altPosterId && typeof altPosterId !== "number") ||
      typeof dataEndpoint !== "string"
    ) {
      console.info({ filmSlug, altPosterId, dataEndpoint });
      return;
    }

    metadata.push({
      filmSlug,
      // @ts-expect-error idk
      altPosterId,
      dataEndpoint,
    });
  });

  return metadata;
}

/**
 * Fetch metadata for each film from the data endpoint
 */
async function fetchFilmsMetadata(
  filmsMetadata: Awaited<ReturnType<typeof scrapePostersForMetadata>>
) {
  logger.info(`Fetching metadata for ${filmsMetadata.length} films`);
  const metadata = [];

  try {
    // do one a time to avoid rate limiting
    for (const meta of filmsMetadata) {
      const { dataEndpoint } = meta;
      const res = await wrappedFetch(`https://letterboxd.com${dataEndpoint}`);
      if (!res.ok) {
        logger.error({ ...FETCH_FAILED, status: res.status });
        continue;
      }
      const json = await res.json();
      const parsed = z
        .object({
          result: z.boolean(),
          csrf: z.string(),
          id: z.number(),
          uid: z.string(),
          name: z.string(),
          slug: z.string(),
          originalName: z.string().nullable(),
          releaseYear: z.number(),
          runTime: z.number(),
          directors: z.array(z.object({ name: z.string() })),
        })
        .safeParse(json);

      if (!parsed.success) {
        logger.error(parsed.error);
        continue;
      }

      const { id, name, originalName, releaseYear, runTime, slug, directors } =
        parsed.data;

      // scrape the poster
      const { altPosterId } = meta;
      logger.debug(`Scraping poster for ${slug}: ${altPosterId}`);
      const posterFetchUrl = `https://letterboxd.com/ajax/poster/film/inglourious-basterds/std${altPosterId ? `/${altPosterId}` : ""}/125x187/?k=_6faea582`;
      const posterHtml = await scrapeHtml(posterFetchUrl);
      const $poster = cheerio(posterHtml);
      // TODO Add a fallback poster if the poster is not found
      const poster = $poster("img").first().prop("src") ?? "";
      logger.warn(`Poster: ${posterFetchUrl} ${poster} for ${slug}`);

      metadata.push({
        id,
        name,
        originalName,
        poster,
        releaseYear,
        runtime: runTime,
        slug,
        directors: directors.map((director) => director.name),
      });
    }

    logger.info(metadata);
    return metadata;
  } catch (error) {
    logger.error(error);
  }
}

/** Scrape EVEN MORE metadata directly from each film page */
async function fetchAndScrapeAdditionalMetadata(
  metadata: Awaited<ReturnType<typeof fetchFilmsMetadata>>
) {
  if (!metadata) return;
  const additionalMetadata = [];

  for (const film of metadata) {
    logger.debug(`Scraping additional metadata for ${film.slug}`);
    try {
      const html = await scrapeHtml(`https://letterboxd.com/film/${film.slug}`);

      const $ = cheerio(html);

      const tagline = $(".review .tagline").text();
      const description = $(".review .truncate").text();

      const cast: string[] = [];
      $("#tab-cast .cast-list a").each((_, el) => {
        const $el = $(el);
        cast.push($el.text());
      });

      const genres: string[] = [];
      $("#tab-genres a").each((_, el) => {
        const $el = $(el);
        genres.push($el.text());
      });

      const imdbid = $(".micro-button[data-track-action='IMDb']")
        .prop("href")
        ?.match(/tt\d+/)?.[0];
      const tmdbid = $(".micro-button[data-track-action='TMDB']")
        .prop("href")
        ?.match(/\/(\d+)\/?$/)?.[1];

      if (!tmdbid) {
        logger.error(`Failed to scrape TMDB ID for ${film.slug}`);
        continue;
      }

      additionalMetadata.push({
        ...film,
        tagline,
        description,
        cast,
        genres,
        imdbid,
        tmdbid,
      });
    } catch (error) {
      logger.error(`Failed to scrape additional metadata for ${film.slug}`);
      logger.error(error);
      continue;
    }
  }

  return additionalMetadata;
}

/** Begin a scrape of a Letterboxd url. */
export async function letterboxdScraper(
  url: string
): Promise<
  { catalogName: string; metadata: LetterboxdScraperItem[] } | undefined
> {
  try {
    const html = await scrapeHtml(url);

    const $ = cheerio(html);

    const catalogName = await determineCatalogName({ url });

    logger.info("Scraping Letterboxd list");
    const posterMetadata = scrapePostersForMetadata($);

    logger.info("Fetching film metadata");
    const filmMetadata = await fetchFilmsMetadata(posterMetadata);

    logger.info("Scraping additional metadata");
    const additionalMetadata =
      await fetchAndScrapeAdditionalMetadata(filmMetadata);
    if (!additionalMetadata) {
      return undefined;
    }

    logger.info("Scraping complete");
    const items: LetterboxdScraperItem[] = additionalMetadata.map((meta) => {
      return {
        cast: meta.cast.slice(0, 4),
        description: meta.description,
        directors: meta.directors,
        genres: meta.genres.slice(0, 3),
        releaseDate: meta.releaseYear,
        title: meta.name,
        tmdbId: meta.tmdbid,
        imdbId: meta.imdbid,
        poster: meta.poster,
        runtime: meta.runtime,
      };
    });

    return { metadata: items, catalogName };
  } catch (error) {
    logger.error("Failed to scrape Letterboxd URL");
    logger.error(error);
  }

  return undefined;
}
