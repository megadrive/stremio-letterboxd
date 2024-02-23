import { addonFetch as fetch } from "./lib/fetch.js";
import name_to_imdb from "name-to-imdb";
import { promisify } from "util";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma.js";
import {
  type CinemetaMovieResponseLive,
  type StremioMetaPreview,
  config,
} from "./consts.js";
import {
  generateWatchlistURL,
  doesLetterboxdUserExist,
  isOld,
} from "./util.js";
import { fileURLToPath } from "url";
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
  name?: string;
  year?: string;
  poster?: string;
};

/** Gets an IMDB ID from a film */
async function getImdbID(film: IFilm) {
  const query = `${film.slug} ${
    film.year && !/(19|2[0-9])[0-9]{2,}/.test(film.slug) ? film.year : ""
  }`.replace(/ +/g, " ");

  let id = await nameToImdb({
    name: query,
    type: "movie",
  });
  console.log(`Found ${id} from ${query}`);
  if (!id) {
    console.warn(`No IMDB ID found: ${query}`);
    console.log(`Trying for a short`);
    id = await nameToImdb({
      name: query,
      type: "short",
    });
    if (!id) {
      return undefined;
    }
    console.log(`Found ${id} from ${query} as a short`);
  }

  return id;
}

/** Parse a Cinemeta API response into a Streamio Meta Preview object. */
function parseCinemetaInfo(
  meta: CinemetaMovieResponseLive["meta"]
): StremioMetaPreview {
  const { id, name, poster } = meta;
  return {
    id,
    name,
    type: "movie",
    poster,
  };
}

/** Gets many IMDB ID from films */
async function getImdbIDs(films: IFilm[]) {
  console.log(`Getting ${films.length} IMDB IDs.`);
  return Promise.all(films.map(getImdbID));
}

/** Gets Meta information for a single IMDB ID from Cinemeta */
async function getCinemetaInfo(
  imdbId: `tt${number}` | string
): Promise<StremioMetaPreview> {
  console.log(`[cinemeta] Getting meta for ${imdbId}`);

  const res = await fetch(
    // `https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`
    `https://cinemeta-live.strem.io/meta/movie/${imdbId}.json`
  );
  if (res.ok) {
    const { meta } = (await res.json()) as CinemetaMovieResponseLive;

    return {
      id: meta.id,
      type: meta.type,
      name: meta.name,
      poster: meta.poster,
    };
  } else {
    throw Error(`[${imdbId}] failed to get Cinemeta`);
  }
}

/** Get Meta information for many IMDB IDs from Cinemeta */
async function getCinemetaInfoMany(imdb_ids: `tt${number}`[] | string[]) {
  let rv: StremioMetaPreview[] = [];
  const cached = await prisma.cinemeta.findMany({
    where: {
      id: {
        in: imdb_ids.filter((id) => !!id) as Exclude<
          typeof imdb_ids,
          null[] | undefined[]
        >,
      },
    },
  });
  console.log(cached.map((c) => JSON.parse(c.info).name));
  rv = [...cached.map((c) => parseCinemetaInfo(JSON.parse(c.info)))];

  // get non-cached ids
  let toFetch = imdb_ids.filter((id) => {
    return cached.findIndex((cache) => cache.id === id) === -1;
  });
  // also get expired ids > 1d
  toFetch = [
    ...toFetch,
    // filter if too old, then map the id
    ...cached.filter((c) => isOld(c.updatedAt, 86400000)).map((c) => c.id),
  ];

  console.log(
    `[cinemeta] need to fetch ${toFetch.length} metas, ${
      imdb_ids.length - toFetch.length
    } are in cache`
  );

  if (toFetch.length !== 0) {
    // split into 0-99 chunks
    const chunks = ((): string[][] => {
      const chunkSize = 100;
      let chunks: (typeof toFetch)[] = [];
      for (let i = 0; i < toFetch.length; i += chunkSize) {
        chunks.push(toFetch.slice(i, i + chunkSize));
      }
      return chunks;
    })();

    const fetched = await (async () => {
      const rv: CinemetaMovieResponseLive["meta"][] = [];

      const fetchChunk = async (
        chunk: string[]
      ): Promise<CinemetaMovieResponseLive["meta"][] | null[]> => {
        try {
          // TODO: There is a null happening here when using thisisalexei's watchlist. Why? Idk.
          const res = await fetch(
            `https://v3-cinemeta.strem.io/catalog/movie/last-videos/lastVideosIds=${chunk.join(
              ","
            )}.json`
          );
          console.log(
            `https://v3-cinemeta.strem.io/catalog/movie/last-videos/lastVideosIds=${chunk.join(
              ","
            )}.json`
          );

          if (!res.ok) {
            throw Error(`couldn't fetch metadata`);
          }

          const json = (await res.json()) as {
            metasDetailed: CinemetaMovieResponseLive["meta"][] | null[];
          };
          return json.metasDetailed;
        } catch (error) {
          console.error(error);
          return [];
        }
      };

      for (let chunk of chunks) {
        console.log(`[cinemeta] getting chunk ${rv.length}`);
        const res = await fetchChunk(chunk);
        const filtered = res.filter((meta) => {
          return !!meta;
        }) as CinemetaMovieResponseLive["meta"][];
        rv.push(...filtered);
      }

      return [
        ...rv.reduce<CinemetaMovieResponseLive["meta"][]>((acc, curr) => {
          acc.push(curr);
          return acc;
        }, []),
      ];
    })();

    rv = [
      ...rv,
      ...fetched.map((film): StremioMetaPreview => {
        return {
          id: film.id,
          name: film.name,
          poster: film.poster,
          type: "movie",
        };
      }),
    ];

    // cache the data
    /* async */ Promise.all(
      fetched.map((d) => {
        return prisma.cinemeta.upsert({
          where: {
            id: d.id,
          },
          create: {
            id: d.id,
            info: JSON.stringify(d),
          },
          update: {
            info: JSON.stringify(d),
          },
        });
      })
    )
      .then(() => console.log("[cinemeta] updated cache"))
      .catch((error) => {
        console.error("Failed to cache Cinemeta data.");
        console.error(error);
      });
  }

  // Sort to the provided order.
  rv = ((): typeof rv => {
    const sorted: typeof rv = [];

    for (const id of imdb_ids) {
      const found = rv.findIndex((film) => film.id === id);
      if (found >= 0) {
        sorted.push(rv[found]);
      }
    }

    return sorted;
  })();

  return rv;
}

async function upsertLetterboxdUserWithMovies(
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
    !isOld(cached_user.updatedAt, config.cache_user_stale_time)
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

async function getDBCachedUser(username: string) {
  const user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });

  if (!user) throw Error("no user found");
  if (isOld(user.updatedAt, config.cache_user_stale_time))
    throw Error(`[${username}]: stale user data`);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids);
  console.log(`[${username}]: got ${parsed_movie_ids.length} movie ids`);
  const movie_info = await getCinemetaInfoMany(parsed_movie_ids);

  console.log(
    `[${username}]: got metadata ${movie_info.length} -> ${movie_info.map((m) =>
      m ? m.name : undefined
    )}`
  );

  return { ...user, movies: movie_info };
}

async function getFilmDataFromLetterboxd(
  letterboxdSlug: string
): Promise<IFilm | undefined> {
  // https://letterboxd.com/ajax/poster/film/wait-until-dark/std/125x187/?k=851e7b94
  try {
    const url = `https://letterboxd.com/ajax/poster/film/${letterboxdSlug}/std/125x187/?k=`;
    const res = await fetch(url);
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

/** Fetch a page from a Letterboxd user's watchlist */
async function fetchWatchlistPage(
  username: Parameters<typeof fetchWatchlist>[0],
  options: Partial<Parameters<typeof fetchWatchlist>[1] & { page: number }> = {
    preferLetterboxdPosters: false,
    page: 1,
  }
) {
  console.log(`[${username}] getting page ${options.page}`);
  const rawHtml = await (
    await fetch(generateWatchlistURL(username, options.page))
  ).text();
  const $$ = cheerio(rawHtml);

  // Get the film slugs from Letterboxd
  const filmSlugs = $$(".poster")
    .map(function () {
      const slug = $$(this).data().filmSlug as string;
      if (!slug || typeof slug !== "string") return slug;
      console.log("filmSlugs", { slug });
      return slug.replace(/-/g, " ");
    })
    .toArray();

  console.log(`[${username}] got ${filmSlugs.length} films`);

  // Attempt to get the year of release from the detail page
  const filmSlugs_and_years = await Promise.all(
    filmSlugs
      .filter((slug) => !!slug)
      .map(async (slug) => {
        console.log("getfilmdata", { slug });
        const filmInfo = await getFilmDataFromLetterboxd(
          typeof slug === "string" ? slug.replace(/ /g, "-") : `${slug}`
        );
        return {
          ...filmInfo,
          slug,
        };
      })
  );

  console.log(
    `[${username}] got ${filmSlugs_and_years.length} data from letterboxd`
  );

  const imdbIds = await getImdbIDs(filmSlugs_and_years);
  const films_with_metadata = await getCinemetaInfoMany(imdbIds);

  console.log(`[${username}] got ${films_with_metadata.length} imdb IDs`);

  return films_with_metadata;
}

// const replaceMetaWithLetterboxdPosters = (
//   metas: Awaited<ReturnType<typeof fetchWatchlistPage>>
// ) => {
//   return metas.map((meta) => {
//     console.log(`replacing letterboxd posters`);
//     if (!meta) {
//       console.log("no meta");
//       return meta;
//     }
//     if (!meta.letterboxd?.poster) {
//       console.log("no poster", meta.letterboxd);
//       return meta;
//     }
//     const newMeta = {
//       ...meta,
//       poster: `/poster/${meta.letterboxd.poster}`,
//     };

//     return newMeta;
//   });
// };

/**
 * fetch a Letterboxd user's watchlist
 * @TODO Make this return early with the first page, then spawn a child process to grab the rest.
 */
export async function fetchWatchlist(
  username: string,
  options: {
    preferLetterboxdPosters?: boolean;
  } = { preferLetterboxdPosters: true }
): Promise<{
  source?: "fresh" | "cache";
  metas: Awaited<ReturnType<typeof fetchWatchlistPage>>;
}> {
  try {
    let cachedUser = await getDBCachedUser(username);
    console.log(`[${username}]: serving cached`);
    if (options.preferLetterboxdPosters) {
      // @ts-ignore next-line
      cachedUser = replaceMetaWithLetterboxdPosters(
        // @ts-ignore next-line
        cachedUser.movies
      );
    }
    // @ts-ignore next-line
    return { metas: cachedUser.movies };
  } catch (error) {
    console.warn(`[${username}]: No user or old data, continuing..`);
  }

  try {
    if (!doesLetterboxdUserExist(username))
      throw Error(`[${username}}: Letterboxd user does not exist.`);

    const rawHtml = await (await fetch(generateWatchlistURL(username))).text();
    const $ = cheerio(rawHtml);

    const pages = +$(".paginate-page").last().text();
    console.log(`[${username}] has ${pages} pages on their watchlist`);

    // grab the first page
    const filmsFromWatchlist = await fetchWatchlistPage(username, {
      preferLetterboxdPosters: false,
    });

    // full data will go in here
    const metaToReturn: Awaited<ReturnType<typeof fetchWatchlist>> = {
      metas: filmsFromWatchlist,
    };

    // return {
    //   ...metaToReturn,
    //   // @ts-ignore
    //   metas: metaToReturn.metas.map((m) => {
    //     if (!m) return m;
    //     return {
    //       id: m.id,
    //       type: m.type,
    //       name: m.name,
    //       poster: m.poster,
    //     };
    //   }),
    // };

    // get rest of pages, pull this into another function later
    for (let page = 2; page <= pages; page++) {
      let newPage = await fetchWatchlistPage(username, { page });
      metaToReturn.metas = [...metaToReturn.metas, ...newPage];
    }

    // if we/the user prefer letterboxd posters, use those instead
    console.log(
      `[${username}] prefer letterboxd posters? ${options.preferLetterboxdPosters}`
    );
    // if (options.preferLetterboxdPosters) {
    //   metaToReturn.metas = replaceMetaWithLetterboxdPosters(metaToReturn.metas);
    // }

    /* async */ upsertLetterboxdUserWithMovies(username, metaToReturn.metas)
      .then((user) =>
        console.log(
          `[${username}]: updated user @ ${user.updatedAt} with ${
            JSON.parse(user.movie_ids).length
          } movies.`
        )
      )
      .catch((err) => console.error(err));

    return {
      metas: metaToReturn.metas,
    };
  } catch (error) {
    console.error(error);
    return { metas: [] };
  }
}
