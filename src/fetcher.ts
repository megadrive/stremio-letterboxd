import fetch from "cross-fetch";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma";
const nameToImdb = promisify(name_to_imdb);

const Watchlist_URL = (username: string) =>
  `https://letterboxd.com/${username}/watchlist`;

type Movie = {
  name: string;
  type: "movie";
  poster: string;
  id: string;
  description: string;
};

const ONE_HOUR = 3600000;
const is_old = (datetime: Date) => Date.now() - datetime.getTime() > ONE_HOUR;

async function get_tmdb_info(imdb_id: string) {
  console.log(`[${imdb_id}]: Getting database cache`);
  const cached = await prisma.movie.findUnique({
    where: {
      id: imdb_id,
    },
  });

  if (cached && !is_old(cached.updated_at)) {
    console.log(`[${imdb_id}]: Serving database cache`);
    return cached;
  }

  console.log(`[${imdb_id}]: Fetching fresh data from TMDB`);
  const { movie_results } = await (
    await fetch(
      `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${process.env.TMDB_API_TOKEN}&external_source=imdb_id`
    )
  ).json();

  const { title, overview, poster_path } = movie_results[0];
  /* TMDB Movie schema
{
  "movie_results": [
    {
      "adult": false,
      "backdrop_path": "/44immBwzhDVyjn87b3x3l9mlhAD.jpg",
      "id": 934433,
      "title": "Scream VI",
      "original_language": "en",
      "original_title": "Scream VI",
      "overview": "Following the latest Ghostface killings, the four survivors leave Woodsboro behind and start a fresh chapter.",
      "poster_path": "/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg",
      "media_type": "movie",
      "genre_ids": [
        27,
        9648,
        53
      ],
      "popularity": 853.917,
      "release_date": "2023-03-08",
      "video": false,
      "vote_average": 7.388,
      "vote_count": 708
    }
  ],
  "person_results": [],
  "tv_results": [],
  "tv_episode_results": [],
  "tv_season_results": []
}
  */

  const data = {
    id: imdb_id,
    name: title,
    poster: poster_path,
    description: overview,
  };

  const upserted = await prisma.movie.upsert({
    where: { id: imdb_id },
    create: {
      id: imdb_id,
      name: data.name,
      poster: data.poster,
      description: data.description,
    },
    update: {
      name: data.name,
      poster: data.poster,
      description: data.description,
    },
  });

  return upserted;
}

async function get_imdb_id(film_name: string): Promise<Movie> {
  const id = await nameToImdb(film_name);
  if (!id) throw Error("No IMDB ID found.");
  const data = await get_tmdb_info(id);
  const poster = `https://images.metahub.space/poster/small/${data.id}/img`;
  const name = data.name;
  return {
    id,
    type: "movie",
    name,
    poster,
    description: data.description,
  };
}

async function get_imdb_ids(film_names: string[]): Promise<Movie[]> {
  return Promise.all(film_names.map(get_imdb_id));
}

async function create_username_record(username: string, movies: Movie[]) {
  console.log(`Caching ${username} to database.`);

  // create movies
  const upsert = async (movie: Movie) => {
    const data = await prisma.movie.upsert({
      where: {
        id: movie.id,
      },
      create: {
        id: movie.id,
        name: movie.name,
        description: movie.description,
        poster: movie.poster,
      },
      update: {
        id: movie.id,
        name: movie.name,
        description: movie.description,
        poster: movie.poster,
      },
    });

    return data;
  };
  await Promise.all(movies.map(upsert));

  // create user and relations
  const user = await prisma.letterboxdUser.upsert({
    where: { id: username },
    create: {
      id: username,
      movies: {
        connect: movies.map((movie) => {
          return { id: movie.id };
        }),
      },
    },
    update: {
      id: username,
      movies: {
        connect: movies.map((movie) => {
          return { id: movie.id };
        }),
      },
    },
  });

  return user;
}

async function get_cached_user(username: string) {
  const user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
    include: { movies: true },
  });

  if (!user) throw Error("no user found");

  return user;
}

export async function watchlist_fetcher(
  username: string
): Promise<{ metas: Movie[] }> {
  try {
    const cached_user_movies = await get_cached_user(username);
    const purged_movies = cached_user_movies.movies.map(
      ({ id, name, description, poster }) => {
        return { id, name, description, poster, type: "movie" };
      }
    ) as Movie[];
    console.log(`[${username}]: serving cached`);
    return { metas: purged_movies };
  } catch (error) {
    console.warn(`[${username}]: No user or old data, continuing..`);
  }

  try {
    const rawHtml = await (await fetch(Watchlist_URL(username))).text();
    const $ = cheerio(rawHtml);

    const filmSlugs = $(".poster")
      .map(function () {
        return $(this).data().filmSlug;
      })
      .toArray() as string[];

    const films = filmSlugs.map((slug) => slug.replace(/-/g, " "));

    const films_with_data = await get_imdb_ids(films);

    // TODO: Cache the user's list onto a database.
    await create_username_record(username, films_with_data);

    const meta = { metas: films_with_data };
    return meta;
  } catch (error) {
    return { metas: [] };
  }
}
