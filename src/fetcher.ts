import fetch from "cross-fetch";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma.js";
import { config } from "./consts.js";
import { Watchlist_URL, does_letterboxd_user_exist } from "./util.js";
const nameToImdb = promisify(name_to_imdb);

// type Movie = {
//   name: string;
//   type: "movie";
//   poster: string;
//   id: string;
//   description?: string;
//   releaseInfo?: string;
// };

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

async function get_meta_info(imdb_id: string) {
  console.log(`[${imdb_id}]: Getting Cinemeta meta information`);
  const meta = await (
    await fetch(`https://v3-cinemeta.strem.io/meta/movie/${imdb_id}.json`)
  ).json();

  return meta;
}

/** Gets many IMDB ID from films */
async function get_imdb_id(film_name: string) {
  const id = await nameToImdb({
    name: film_name,
    type: "movie",
  });
  if (!id) {
    console.warn(`No IMDB ID found: ${film_name}`);
    return undefined;
  }
  const data = await get_meta_info(id);
  if (!data) console.warn(`[${film_name}]: no data found`);
  return data;
}

/** Gets an IMDB ID from a film */
async function get_imdb_ids(films: IFilm[]) {
  return Promise.all(
    films
      .map((film) => `${film.slug} ${film.year ? film.year : ""}`)
      .map(get_imdb_id)
  );
}

/** Gets Meta information for a single IMDB ID from Cinemeta */
async function get_meta_single(imdb_id: `tt${number}` | string) {
  const res = await fetch(
    `https://v3-cinemeta.strem.io/meta/movie/${imdb_id}.json`
  );
  if (res.ok) {
    const rv = await res.json();
    return rv.meta;
  } else {
    throw Error(`[${imdb_id}] failed to get Cinemeta`);
  }
}

/** Get Meta information for many IMDB IDs from Cinemeta */
async function get_meta_many(imdb_ids: `tt${number}`[] | string[]) {
  return Promise.all(imdb_ids.map(get_meta_single));
}

async function create_username_record(
  username: string,
  movies: { [key: string]: any }
) {
  console.log(`Caching ${username} to database.`);

  // create user
  const cached_user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });
  if (
    cached_user &&
    !is_old(cached_user.updatedAt, config.cache_user_stale_time)
  ) {
    return cached_user;
  }

  movies = movies.filter(Boolean);
  const user = await prisma.letterboxdUser.upsert({
    where: { id: username },
    create: {
      id: username,
      movie_ids: JSON.stringify(movies.map((movie: any) => movie.imdb_id)),
    },
    update: {
      id: username,
      movie_ids: JSON.stringify(movies.map((movie: any) => movie.imdb_id)),
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
    throw Error(`[${username}]: stale user data`);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids);
  console.log(`[${username}]: got ${parsed_movie_ids.length} movie ids`);
  const movie_info = await get_meta_many(parsed_movie_ids);
  console.log(
    `[${username}]: got metadata -> ${movie_info.map((m) =>
      m ? m.imdb_db : undefined
    )}`
  );

  return { ...user, movies: movie_info };
}

async function get_letterboxd_film_data(
  letterboxd_slug: string
): Promise<null | {
  name: string;
  year: string;
  poster: string;
}> {
  // https://letterboxd.com/ajax/poster/film/wait-until-dark/std/125x187/?k=851e7b94
  try {
    const res = await fetch(
      `https://letterboxd.com/ajax/poster/film/${letterboxd_slug}/std/125x187/?k=`
    );
    if (!res.ok) {
      throw Error(`[${letterboxd_slug}]: Couldn't get Letterboxd info.`);
    }
    const rawHtml = await res.text();
    const $ = cheerio(rawHtml);
    const year = $("div").data("filmReleaseYear") as string;
    const name = $("div").data("filmName") as string;
    let poster = $("img").prop("srcset") as string;
    if (poster) {
      poster = poster.replace(/-250-/g, "-400-").replace(/-375-/g, "-600-");
    }

    return { name, year, poster };
  } catch (error) {
    console.log(error);
  }

  return null;
}

/** fetch a Letterboxd user's watchlist */
export async function watchlist_fetcher(
  username: string
): Promise<{ source?: "fresh" | "cache"; metas: any }> {
  try {
    const cached_user_movies = await get_cached_user(username);
    console.log(`[${username}]: serving cached`);
    return { source: "cache", metas: cached_user_movies.movies };
  } catch (error) {
    console.warn(`[${username}]: No user or old data, continuing..`);
  }

  try {
    if (!does_letterboxd_user_exist(username))
      throw Error(`[${username}}: Letterboxd user does not exist.`);

    const rawHtml = await (await fetch(Watchlist_URL(username))).text();
    const $ = cheerio(rawHtml);

    const pages = +$(".paginate-page").last().text();
    console.log(`[${username}] has ${pages} pages on their watchlist`);

    const filmData: Awaited<ReturnType<typeof watchlist_fetcher>> = {
      source: "fresh",
      metas: [],
    };

    for (let page = 0; pages >= page; page++) {
      console.log(`getting page ${page} for ${username}`);
      const rawHtml = await (await fetch(Watchlist_URL(username, page))).text();
      const $$ = cheerio(rawHtml);

      // Get the film slugs from Letterboxd
      const filmSlugs = $$(".poster")
        .map(function () {
          const slug = $$(this).data().filmSlug as string;
          if (!slug || typeof slug !== "string") return slug;
          return slug.replace(/-/g, " ");
        })
        .toArray();

      console.log(filmSlugs);

      // Attempt to get the year of release from the detail page
      const filmSlugs_and_years = await Promise.all(
        filmSlugs.map(async (slug) => {
          //   const filmPage = await (
          //     await fetch(`https://letterboxd.com/film/${slug}`)
          //   ).text();
          //   const $$$ = cheerio(filmPage);
          //   const year = $$$("small.number", "#featured-film-header").text();
          //   console.log({ slug, year });

          //   return { slug, year };
          const filmInfo = await get_letterboxd_film_data(slug);
          return {
            ...filmInfo,
            slug,
          };
        })
      );

      console.log(filmSlugs_and_years);

      // Only return the meta from the request
      let films_with_data;
      films_with_data = (await get_imdb_ids(filmSlugs_and_years))
        .filter((f) => !!f)
        .map((film) => film.meta);

      console.log(films_with_data);

      filmData.metas = [...filmData.metas, ...films_with_data];
    }

    /* async */ create_username_record(username, filmData.metas)
      .then((user) =>
        console.log(
          `[${username}]: updated user @ ${user.updatedAt} with ${
            JSON.parse(user.movie_ids).length
          } movies.`
        )
      )
      .catch((err) => console.error(err));

    return filmData;
  } catch (error) {
    console.log(error);
    return { metas: [] };
  }
}
