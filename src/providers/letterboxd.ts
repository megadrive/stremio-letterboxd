import { addonFetch } from "../lib/fetch.js";
import { load as cheerio } from "cheerio";

export async function find(letterboxdSlug: string) {
  try {
    const url = `https://letterboxd.com/film/${letterboxdSlug.replace(
      / /gi,
      "-"
    )}`;
    const res = await addonFetch(url, {
      keepalive: false,
    });
    if (!res.ok) {
      throw Error(`[${letterboxdSlug}]: Couldn't get Letterboxd info: ${url}`);
    }

    const html = await res.text();
    const $ = cheerio(html);

    const imdbUrl = $('a[data-track-action="IMDb"]').attr("href");
    const rimdb = /tt[0-9]+/;

    const match = imdbUrl?.match(rimdb);
    if (!match) return undefined;

    const id = match[0];

    console.info({ letterboxd: letterboxdSlug, imdb: id });
    return { letterboxd: letterboxdSlug, imdb: id };
  } catch (error) {
    console.error(error.message);
  }

  return undefined;
}

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
