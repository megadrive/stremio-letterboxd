import fetch from "cross-fetch";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
const nameToImdb = promisify(name_to_imdb);

const cache = new Map<string, any>();

const Watchlist_URL = (username: string) =>
  `https://letterboxd.com/${username}/watchlist`;

type Movie = {
  name: string;
  type: "movie";
  poster: string;
  id: string;
};

async function get_tmdb_info(imdb_id: string) {
  if (cache.has(imdb_id)) {
    return cache.get(imdb_id);
  }

  const { movie_results } = await (
    await fetch(
      `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${process.env.TMDB_API_TOKEN}&external_source=imdb_id`
    )
  ).json();

  movie_results.fetched = Date.now();

  cache.set(imdb_id, movie_results[0]);
  return movie_results[0];
}

async function get_imdb_id(film_name: string): Promise<Movie> {
  const id = await nameToImdb(film_name);
  const data = await get_tmdb_info(id);
  const poster = "http://image.tmdb.org/t/p/w150/" + data.poster_path;
  const name = data.title;
  return {
    id,
    type: "movie",
    name,
    poster,
  };
}

async function get_imdb_ids(film_names: string[]): Promise<Movie[]> {
  return Promise.all(film_names.map(get_imdb_id));
}

export async function watchlist_fetcher(
  username: string
): Promise<{ metas: Movie[] }> {
  const rawHtml = await (await fetch(Watchlist_URL(username))).text();
  const $ = cheerio(rawHtml);

  const filmSlugs = $(".poster")
    .map(function () {
      return $(this).data().filmSlug;
    })
    .toArray() as string[];

  const films = filmSlugs.map((slug) => slug.replace(/-/g, " "));

  const finished_result = await get_imdb_ids(films);

  const meta = { metas: finished_result };
  console.log(meta);

  return meta;
}
