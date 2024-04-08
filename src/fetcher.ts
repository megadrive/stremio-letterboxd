import { addonFetch } from "./lib/fetch.js";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma.js";
import {
  type CinemetaMovieResponseLive,
  type StremioMetaPreview,
  config,
  LetterboxdUsernameOrListRegex,
  StremioMeta,
} from "./consts.js";
import {
  generateURL,
  doesLetterboxdListExist,
  isOld,
  formatTimeBetween,
} from "./util.js";
// import { findMovie } from "./lib/cinemeta.js";
import { find } from "./providers/letterboxd.js";
import { find as findImdb } from "./providers/imdbSuggests.js";

type IFilm = {
  slug: string;
  name?: string;
  year?: string;
  poster?: string;
};

/** Parse a Cinemeta API response into a Streamio Meta Preview object. */
function parseCinemetaInfo(meta: CinemetaMovieResponseLive["meta"]) {
  return meta;
  // const { id, name, poster } = meta;
  // return {
  //   id,
  //   name,
  //   type: "movie",
  //   poster,
  // };
}

/** Gets many IMDB ID from films */
async function getImdbIDs(films: string[]) {
  const IDs: string[] = [];
  const filmPromises = films.map((f) => find(f));
  const results = await Promise.allSettled(filmPromises);
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      IDs.push(result.value.imdb);
    }
  });

  return IDs;
}

/** Get Meta information for many IMDB IDs from Cinemeta */
async function getCinemetaInfoMany(imdb_ids: `tt${number}`[] | string[]) {
  let rv: StremioMeta[] = [];
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
  // @ts-ignore
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

  console.info(
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
      ): Promise<typeof rv | null[]> => {
        try {
          // TODO: There is a null happening here when using thisisalexei's watchlist. Why? Idk.
          const res = await addonFetch(
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
        try {
          console.info(`[cinemeta] getting chunk ${rv.length}`);
          const res = await fetchChunk(chunk);
          const filtered = res.filter(
            Boolean
          ) as CinemetaMovieResponseLive["meta"][];
          rv.push(...filtered);
        } catch {
          console.info(`Couldn't fetch chunk ${rv.length}`);
          continue;
        }
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
      ...fetched,
      // ...fetched.map((film): StremioMetaPreview => {
      //   return {
      //     id: film.id,
      //     name: film.name,
      //     poster: film.poster,
      //     type: "movie",
      //   };
      // }),
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
      .then(() => console.info("[cinemeta] updated cache"))
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
  movies: StremioMetaPreview[]
) {
  console.info(`Caching ${username} to database.`);

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
      movie_ids: JSON.stringify(movies.map((movie) => movie.id)),
    },
    update: {
      id: username,
      movie_ids: JSON.stringify(movies.map((movie) => movie.id)),
    },
  });

  return user;
}

/** Gets a cached user from the DB. Throws if no user or if the data is old. */
async function getDBCachedUser(username: string) {
  const user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });

  if (!user) throw Error("no user found");
  if (isOld(user.updatedAt, config.cache_user_stale_time))
    throw Error(`[${username}]: stale user data`);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids) as string[];
  console.info(`[${username}]: got ${parsed_movie_ids.length} movie ids`);
  // const movie_info = await getCinemetaInfoMany(parsed_movie_ids);
  const movie_info: StremioMetaPreview[] = [];
  for (const imdbid of parsed_movie_ids) {
    const found = await findImdb(imdbid);
    movie_info.push({
      id: found[0].imdb_id,
      name: found[0].name,
      type: "movie",
      poster: found[0].image,
    });
  }

  console.info(
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
    const url = `https://letterboxd.com/ajax/poster/film/${letterboxdSlug.replace(
      / /gi,
      "-"
    )}/std/125x187/?k=`;
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

/** Fetch a page from a Letterboxd user's watchlist */
async function fetchWatchlistPage(
  username: Parameters<typeof fetchWatchlist>[0],
  options: Partial<Parameters<typeof fetchWatchlist>[1] & { page: number }> = {
    preferLetterboxdPosters: false,
    page: 1,
  }
) {
  console.info(`[${username}] getting page ${options.page}`);
  const rawHtml = await (
    await addonFetch(generateURL(username, options.page))
  ).text();
  const $$ = cheerio(rawHtml);

  // Get the film slugs from Letterboxd
  const filmSlugs = $$(".poster")
    .map(function () {
      const slug = $$(this).data().filmSlug as string;
      if (!slug || typeof slug !== "string") return slug;
      return slug.replace(/-/g, " ");
    })
    .toArray();

  console.info(`[${username}] got ${filmSlugs.length} films`);

  const imdbIds = await getImdbIDs(filmSlugs);
  const films_with_metadata = await getCinemetaInfoMany(imdbIds);

  console.info(`[${username}] got ${imdbIds.length} imdb IDs`);

  return {
    films: films_with_metadata,
    page: options.page,
  };
}

/**
 * fetch a Letterboxd user's watchlist
 * .TODO Make this return early with the first page, then spawn a child process to grab the rest.
 */
export async function fetchWatchlist(
  letterboxdId: string,
  options: {
    preferLetterboxdPosters?: boolean;
  } = { preferLetterboxdPosters: false }
): Promise<{
  source?: "fresh" | "cache";
  metas: Awaited<
    ReturnType<typeof fetchWatchlistPage> & { elapsed: Date["toString"] }
  >["films"];
}> {
  // early exit, don't continue if the username doesn't match what we expect
  console.info(`[${letterboxdId}] Checking id`);
  if (!LetterboxdUsernameOrListRegex.test(letterboxdId)) {
    console.log(`[${letterboxdId}] id invalid`);
    return { metas: [] };
  }

  const fetchFreshData = async () => {
    try {
      if (!doesLetterboxdListExist(letterboxdId))
        throw Error(`[${letterboxdId}}: does not exist.`);

      const generatedURL = generateURL(letterboxdId);
      console.info(`GeneratedUR: ${generatedURL}`);
      const rawHtml = await (await addonFetch(generatedURL)).text();
      const $ = cheerio(rawHtml);

      let pages = +$(".paginate-page").last().text();
      if (pages === 0) pages = 1;
      console.info(`[${letterboxdId}] has ${pages} pages`);

      // full data will go in here
      const metaToReturn: Awaited<ReturnType<typeof fetchWatchlist>> = {
        metas: [],
      };

      // grab the pages
      const promises = [];
      for (let page = 1; page <= pages; page++) {
        promises.push(fetchWatchlistPage(letterboxdId, { page }));
      }
      // const results = await Promise.allSettled(promises);
      let results = await Promise.all(promises.splice(0, 1));

      while (promises.length) {
        // 10 pages at a time (280 movies at a time)
        results.push(...(await Promise.all(promises.splice(0, 10))));
      }

      results.sort((a, b) => {
        if (!a.page || !b.page) return 0;
        return a.page - b.page;
      });

      results.forEach((result) => {
        metaToReturn.metas = [...metaToReturn.metas, ...result.films];
      });

      // if we/the user prefer letterboxd posters, use those instead
      console.info(
        `[${letterboxdId}] prefer letterboxd posters? ${options.preferLetterboxdPosters}`
      );
      // if (options.preferLetterboxdPosters) {
      //   metaToReturn.metas = replaceMetaWithLetterboxdPosters(metaToReturn.metas);
      // }

      /* async */ upsertLetterboxdUserWithMovies(
        letterboxdId,
        metaToReturn.metas
      )
        .then((user) =>
          console.info(
            `[${letterboxdId}]: updated user . ${user.updatedAt} with ${
              (JSON.parse(user.movie_ids) as string[]).length
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
  };

  const cachedStartTime = Date.now();
  // if we have a cached user, serve that and update in the background for _-sPeEd-_
  try {
    let cachedUser = await getDBCachedUser(letterboxdId);
    console.info(
      `[${letterboxdId}]: ${cachedUser ? "got" : "couldnt get"} cached`
    );
    // if (options.preferLetterboxdPosters) {
    //   cachedUser = replaceMetaWithLetterboxdPosters(
    //     cachedUser.movies
    //   );
    // }

    const cached_movies = await getCinemetaInfoMany(
      JSON.parse(cachedUser.movie_ids) as string[]
    );

    // if less than 1 page, just fetch a fresh set of data
    if (cached_movies.length <= 30) {
      throw Error("Small cache, get a new set of data.");
    }

    const freshStartTime = Date.now();
    /* async */ fetchFreshData()
      .then((data) => {
        console.info(`Fetched fresh data -> ${data.metas.length} films`);
        if (!cachedUser)
          return {
            source: "fresh",
            ...data,
          };

        console.info(
          `[${letterboxdId}] fresh data fetched in ${formatTimeBetween(
            freshStartTime,
            Date.now()
          )} seconds`
        );
        return;
      })
      .catch((error) => {
        console.error("couldnt fetch fresh data after serving cached data");
        console.error(error);
      });

    console.info(
      `[${letterboxdId}] cached time: ${formatTimeBetween(
        cachedStartTime,
        Date.now()
      )}`
    );
    return { metas: cached_movies, source: "cache" };
  } catch (error) {
    console.warn(`[${letterboxdId}]: No user or old data, continuing..`);
  }

  // if we don't then fetch fresh
  const freshData = await fetchFreshData();

  return freshData;
}
