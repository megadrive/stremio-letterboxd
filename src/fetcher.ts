import fetch from "cross-fetch";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma";
import { config } from "./consts";
import { Watchlist_URL, does_letterboxd_user_exist } from "./util";
const nameToImdb = promisify(name_to_imdb);

type Movie = {
  name: string;
  type: "movie";
  poster: string;
  id: string;
  description?: string;
};

type IFilm = {
  slug: string;
  year?: string | number;
};

/**
 * Check if a date is older than the time given.
 * @param datetime Date to check against
 * @param howOld How old in MS to be considered stale.
 */
const is_old = (datetime: Date, howOld: number): boolean => {
  const rv = Date.now() - datetime.getTime() > howOld;
  console.log(
    `[is_old]: ${Date.now() - datetime.getTime()} > ${howOld} = ${rv}`
  );
  return rv;
};

async function get_tmdb_info(imdb_id: string) {
  console.log(`[${imdb_id}]: Getting database cache`);
  const cached = await prisma.movie.findUnique({
    where: {
      id: imdb_id,
    },
  });

  if (cached && !is_old(cached.updated_at, config.cache_tmdb_stale_time * 24)) {
    console.log(`[${imdb_id}]: Serving database cache`);
    return cached;
  }

  console.log(`[${imdb_id}]: Fetching fresh data from TMDB`);
  const { movie_results } = await (
    await fetch(
      `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${process.env.TMDB_API_TOKEN}&external_source=imdb_id`
    )
  ).json();

  if (!movie_results || !movie_results[0]) {
    throw Error(`[${imdb_id}]: No results from TMBD.`);
  }

  const title = movie_results[0].title;
  const overview = movie_results[0].overview;
  const poster_path = movie_results[0].poster_path;

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
  if (!id) throw Error(`No IMDB ID found: ${film_name}`);
  try {
    const data = await get_tmdb_info(id);
    if (!data) throw Error(`[${film_name}]: no data found`);
    const poster = `https://images.metahub.space/poster/small/${data.id}/img`;
    const name = data.name;
    return {
      id,
      type: "movie",
      name,
      poster,
      description: data.description,
    };
  } catch (error) {
    console.log("Error getting IMDB ID:", error);
    return {
      id: "",
      type: "movie",
      name: "",
      poster: "",
      description: "",
    };
  }
}

async function get_imdb_ids(films: IFilm[]): Promise<Movie[]> {
  return Promise.all(
    films.map((film) => `${film.slug} ${film.year}`).map(get_imdb_id)
  );
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
  const cached_user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });
  if (
    cached_user &&
    !is_old(cached_user.updatedAt, config.cache_user_stale_time)
  ) {
    return cached_user;
  }

  const user = await prisma.letterboxdUser.upsert({
    where: { id: username },
    create: {
      id: username,
      movie_ids: JSON.stringify(movies.map((movie) => movie.id)),
    },
    update: {
      id: username,
      movie_ids: JSON.stringify(movies.map((movie) => movie.id)),
    },
  });

  return user;
}

async function get_cached_user(username: string) {
  const user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });

  if (!user) throw Error("no user found");
  if (is_old(user.updatedAt, config.cache_user_stale_time))
    throw Error(`[${username}]: stale movie data`);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids);

  const db_movies = await prisma.movie.findMany({
    where: { id: { in: parsed_movie_ids } },
  });

  const movies = parsed_movie_ids.map((id) =>
    db_movies.find((movie) => movie.id === id)
  );

  return { ...user, movies };
}

export async function watchlist_fetcher(
  username: string
): Promise<{ source?: "fresh" | "cache"; metas: Movie[] }> {
  try {
    const cached_user_movies = await get_cached_user(username);
    const purged_movies = cached_user_movies.movies.map((movie) => {
      return { ...movie, type: "movie" };
    }) as Movie[];
    console.log(`[${username}]: serving cached`);
    return { source: "cache", metas: purged_movies };
  } catch (error) {
    console.warn(`[${username}]: No user or old data, continuing..`);
  }

  try {
    if (!does_letterboxd_user_exist(username))
      throw Error(`[${username}}: Letterboxd user does not exist.`);
    const rawHtml = await (await fetch(Watchlist_URL(username))).text();
    const $ = cheerio(rawHtml);

    const filmSlugs = $(".poster")
      .map(function () {
        const slug = $(this).data().filmSlug as string;
        return slug.replace(/-/g, " ");
      })
      .toArray();

    const films = await Promise.all(
      filmSlugs.map(async (slug) => {
        const filmPage = await (
          await fetch(`https://letterboxd.com/film/${slug}`)
        ).text();
        const $$ = cheerio(filmPage);
        const year = $$("small.number", "#featured-film-header").text();
        console.log({ slug, year });

        return { slug, year };
      })
    );

    // Only return stuff with an ID
    const films_with_data = (await get_imdb_ids(films)).filter((movie) => {
      return movie.id.length > 0;
    });

    // TODO: Cache the user's list onto a database.
    await create_username_record(username, films_with_data);

    return { source: "fresh", metas: films_with_data };
  } catch (error) {
    console.log(error);
    return { metas: [] };
  }
}
