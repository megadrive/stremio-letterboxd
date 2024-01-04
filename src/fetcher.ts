import fetch from "cross-fetch";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
const nameToImdb = promisify(name_to_imdb);

type Movie = {
  name: string;
  id: string;
};
export async function watchlist_fetcher(username: string): Promise<Movie[]> {
  const html = await (
    await fetch(`https://letterboxd.com/${username}/watchlist`)
  ).text();

  console.log(`got html: ${html.length}`);

  const $ = cheerio(html);

  const movies = $(".poster-list").children("a").data("original-title");
  console.log(movies);

  return [];
}
