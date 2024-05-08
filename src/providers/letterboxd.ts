import { addonFetch } from "../lib/fetch.js";
import { load as cheerio } from "cheerio";
import { prisma } from "../prisma.js";
import { StremioMeta } from "../consts.js";

const getHtml = async (
  letterboxdSlug: string,
  overrideUrl?: string
): Promise<ReturnType<typeof cheerio>> => {
  letterboxdSlug = letterboxdSlug.replace(/ /g, "-");
  const url = !overrideUrl
    ? `https://letterboxd.com/film/${letterboxdSlug}`
    : overrideUrl.replace(/\{letterboxdSlug\}/g, letterboxdSlug);
  const res = await addonFetch(url, {
    keepalive: false,
  });
  if (!res.ok) {
    throw Error(`[${letterboxdSlug}]: Couldn't get Letterboxd info: ${url}`);
  }

  const html = await res.text();
  const $ = cheerio(html);
  return $;
};

/**
 * Updates the letterboxd posters.
 * @param letterboxdId Letterboxd slug
 * @returns
 */
const updatePoster = async (letterboxdId: string) => {
  letterboxdId = `${letterboxdId}`;
  try {
    const letterboxd = await prisma.letterboxdPoster.findUnique({
      where: {
        letterboxdId,
      },
    });

    const shouldUpdate =
      letterboxd &&
      Date.now() - letterboxd.updatedAt.getTime() < 1000 * 60 * 60;

    const create = !letterboxd;

    if (!create && !shouldUpdate) {
      // early exit, don't update
      console.info(`Not updating poster for ${letterboxdId}, too recent.`);
      return undefined;
    }

    console.info(
      `${
        create ? "Creating a new poster" : "Updating poster"
      } for ${letterboxdId}`
    );

    const $ = await getHtml(
      letterboxdId,
      "https://letterboxd.com/ajax/poster/film/{letterboxdSlug}/std/1000x1500/?k=53eb16aa"
    );

    const poster = $("img").first().attr("src");
    if (!poster) {
      throw `Couldn't get poster from page for ${letterboxdId}`;
    }
    const upserted = await prisma.letterboxdPoster.upsert({
      where: {
        letterboxdId,
      },
      create: {
        letterboxdId,
        url: poster,
      },
      update: {
        url: poster,
      },
    });

    if (!upserted) {
      throw `Couldn't create poster entry for ${letterboxdId}`;
    }

    return poster;
  } catch (error) {
    console.warn(error);
  }

  return undefined;
};

export async function find(
  letterboxdSlug: string
): Promise<{ letterboxd: string; imdb: string; poster?: string } | undefined> {
  try {
    let rv: { poster?: string } = {};
    // template literal because prisma coerces strings to numbers
    const db = await prisma.letterboxdIMDb.findUnique({
      where: { letterboxd: `${letterboxdSlug}` },
      include: { poster: true },
    });
    if (!db) {
      throw `No record for ${letterboxdSlug}`;
    }
    if (db.poster) {
      // await a poster, then continue
      const poster = await updatePoster(letterboxdSlug);
      rv = { poster };
    }

    // Early return if we have a record already.
    console.info(`Found L-IMDB: ${letterboxdSlug} -> ${db.imdb}`);
    return {
      letterboxd: db.letterboxd,
      imdb: db.imdb,
      ...rv,
    };
  } catch (error) {
    if (typeof error === "string") {
      console.warn(error);
    } else {
      console.error(`Couldn't query db for some reason`);
      console.error(error);
    }
  }

  try {
    const $ = await getHtml(letterboxdSlug);

    const imdbUrl = $('a[data-track-action="IMDb"]').attr("href");
    const rimdb = /tt[0-9]+/;

    const match = imdbUrl?.match(rimdb);
    if (!match) return undefined;

    const id = match[0];

    prisma.letterboxdIMDb
      .create({
        data: {
          letterboxd: letterboxdSlug,
          imdb: id,
        },
      })
      .then(() =>
        console.info(`Created letterboxd->imdb: ${[letterboxdSlug, id]}`)
      )
      .catch((err) => {
        console.error(
          `Prisma error creating letterboxd->imdb: ${letterboxdSlug} -> ${id}`
        );
        console.error(err.message);
      });

    return { letterboxd: letterboxdSlug, imdb: id, poster: undefined };
  } catch (error) {
    console.error(error.message);
  }

  return undefined;
}

export const replacePosters = async (metas: StremioMeta[]) => {
  try {
    const letterboxdImdbIDs = await prisma.letterboxdIMDb.findMany({
      where: {
        imdb: {
          in: metas.map((meta) => meta.id),
        },
      },
      include: {
        poster: true,
      },
    });

    if (!letterboxdImdbIDs || letterboxdImdbIDs.length === 0) {
      throw "No posters found or error.";
    }

    return metas.map((meta) => {
      const found = letterboxdImdbIDs.findIndex((v) => v.imdb === meta.id);
      if (found === -1) {
        console.warn("No letterboxd poster found to replace.");
        return meta;
      }

      if (letterboxdImdbIDs[found].poster.length === 0) {
        console.warn(`No letterboxd posters in database for ${meta.id}`);
        return meta;
      }

      return {
        ...meta,
        poster: letterboxdImdbIDs[found].poster[0].url,
      };
    });
  } catch (error) {
    console.error("Couldn't update with Letterboxd posters");
    console.error(error);
  }

  return metas;
};

export async function find_old(letterboxdSlug: string) {
  // https://letterboxd.com/ajax/poster/film/wait-until-dark/std/125x187/?k=851e7b94
  try {
    const url = `https://letterboxd.com/ajax/poster/film/${letterboxdSlug.replace(
      / /gi,
      "-"
    )}/std/125x187/?k=${Date.now()}`;
    const res = await addonFetch(url);
    if (!res.ok) {
      throw Error(`[${letterboxdSlug}]: Couldn't get Letterboxd info: ${url}`);
    }
    const rawHtml = await res.text();
    const $ = cheerio(rawHtml);

    const slug = $("div").data("filmSlug") as string;
    const year = $("div").data("filmReleaseYear") as string;
    const name = $("div").data("filmName") as string;
    let poster = $("img").prop("srcset") as string;
    if (poster) {
      poster = poster.replace(/-250-/g, "-400-").replace(/-375-/g, "-600-");
    }

    return { slug, name, year, poster };
  } catch (error) {
    console.error(error);
  }

  return undefined;
}
