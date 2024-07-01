import { addonFetch } from "./lib/fetch.js";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma.js";
import {
  type CinemetaMovieResponseLive,
  type StremioMetaPreview,
  type StremioMeta,
  config,
  LetterboxdUsernameOrListRegex,
} from "./consts.js";
import {
  generateURL,
  doesLetterboxdResourceExist,
  isOld,
  formatTimeBetween,
} from "./util.js";
import { find } from "./providers/letterboxd.js";
import { find as findImdb } from "./providers/imdbSuggests.js";
import { logger } from "./logger.js";
import { env } from "./env.js";

const logBase = logger("fetcher");

/** Gets many IMDB ID from films */
async function getImdbIDs(films: string[], userId: string) {
  const IDs: string[] = [];
  const filmPromises = films.map((f) => find(f, userId));
  const results = await Promise.allSettled(filmPromises);
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      IDs.push(result.value.imdb);
    }
  }

  return IDs;
}

/** Get Meta information for many IMDB IDs from Cinemeta */
async function getCinemetaInfoMany(imdb_ids: `tt${number}`[] | string[]) {
  const log = logBase.extend("getCinemetaInfoMany");
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

  rv = [...cached.map((c) => JSON.parse(c.info) as StremioMeta)];

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

  log(
    `[cinemeta] need to fetch ${toFetch.length} metas, ${
      imdb_ids.length - toFetch.length
    } are in cache`,
  );

  if (toFetch.length !== 0) {
    // split into 0-99 chunks
    const chunks = ((): string[][] => {
      const chunkSize = 100;
      const chunks: (typeof toFetch)[] = [];
      for (let i = 0; i < toFetch.length; i += chunkSize) {
        chunks.push(toFetch.slice(i, i + chunkSize));
      }
      return chunks;
    })();

    const fetched = await (async () => {
      const rv: CinemetaMovieResponseLive["meta"][] = [];

      const fetchChunk = async (
        chunk: string[],
      ): Promise<typeof rv | null[]> => {
        try {
          const res = await addonFetch(
            `https://v3-cinemeta.strem.io/catalog/movie/last-videos/lastVideosIds=${chunk.join(
              ",",
            )}.json`,
          );

          if (!res.ok) {
            throw Error(`couldn't fetch metadata`);
          }

          const json = (await res.json()) as {
            metasDetailed: CinemetaMovieResponseLive["meta"][] | null[];
          };
          return json.metasDetailed;
        } catch (error) {
          log(error);
          return [];
        }
      };

      for (const chunk of chunks) {
        try {
          log(`[cinemeta] getting chunk ${rv.length}`);
          const res = await fetchChunk(chunk);
          const filtered = res.filter(
            Boolean,
          ) as CinemetaMovieResponseLive["meta"][];
          rv.push(...filtered);
        } catch {
          log(`Couldn't fetch chunk ${rv.length}`);
        }
      }

      return [
        ...rv.reduce<CinemetaMovieResponseLive["meta"][]>((acc, curr) => {
          acc.push(curr);
          return acc;
        }, []),
      ];
    })();

    rv = [...rv, ...fetched];

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
      }),
    )
      .then(() => log("[cinemeta] updated cache"))
      .catch((error) => {
        log("Failed to cache Cinemeta data.");
        log(error);
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

/**
 * Populate LetterboxdUser with movies from Cinemeta.
 * @returns The cached user, or a new one if it doesn't exist.
 */
async function upsertLetterboxdUserWithMovies(
  username: string,
  movies: StremioMetaPreview[],
) {
  const log = logBase.extend("upsertLetterboxdUserWithMovies");
  log(`Caching ${username} to database.`);

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

  const filteredMovies = movies.filter(Boolean);
  const user = await prisma.letterboxdUser.upsert({
    where: { id: username },
    create: {
      id: username,
      movie_ids: JSON.stringify(filteredMovies.map((movie) => movie.id)),
    },
    update: {
      id: username,
      movie_ids: JSON.stringify(filteredMovies.map((movie) => movie.id)),
    },
  });

  return user;
}

/** Gets a cached user from the DB. Throws if no user or if the data is old. */
async function getDBCachedUser(username: string) {
  const log = logBase.extend("getDBCachedUser");
  const user = await prisma.letterboxdUser.findUnique({
    where: { id: username },
  });

  if (!user) throw Error("no user found");
  if (isOld(user.updatedAt, config.cache_user_stale_time))
    throw Error(`[${username}]: stale user data`);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids) as string[];
  log(`[${username}]: got ${parsed_movie_ids.length} movie ids`);
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

  log(
    `[${username}]: got metadata ${movie_info.length} -> ${movie_info.map(
      (m) => (m ? m.name : undefined),
    )}`,
  );

  return { ...user, movies: movie_info };
}

/** Fetch a page from a Letterboxd user's watchlist */
export async function fetchFilmsSinglePage(
  letterboxdPath: Parameters<typeof fetchFilms>[0],
  options: Partial<Parameters<typeof fetchFilms>[1] & { page: number }> = {
    preferLetterboxdPosters: false,
    page: 1,
  },
) {
  const log = logBase.extend("fetch:single");
  log(`[${letterboxdPath}] getting page ${options.page}`);
  const rawHtml = await (
    await addonFetch(generateURL(letterboxdPath, options.page))
  ).text();
  let $$ = cheerio(rawHtml);

  const getFilmSlugs = () => {
    return $$(".poster")
      .map(function () {
        const slug = $$(this).data().filmSlug as string;
        if (!slug || typeof slug !== "string") return slug;
        return slug.replace(/-/g, " ");
      })
      .toArray();
  };

  // Get the film slugs from Letterboxd
  let filmSlugs = getFilmSlugs();
  if (filmSlugs.length === 0) {
    // try making an ajax request instead
    const ajaxRaw = await (
      await addonFetch(generateURL(letterboxdPath, options.page, true))
    ).text();
    $$ = cheerio(ajaxRaw);
    filmSlugs = getFilmSlugs();
  }

  log(`[${letterboxdPath}] got ${filmSlugs.length} films`);

  const imdbIds = await getImdbIDs(filmSlugs, letterboxdPath);
  const films_with_metadata = await getCinemetaInfoMany(imdbIds);

  log(`[${letterboxdPath}] got ${imdbIds.length} imdb IDs`);

  return {
    films: films_with_metadata,
    page: options.page,
  };
}

/**
 * fetch a Letterboxd user's watchlist
 * .TODO Make this return early with the first page, then spawn a child process to grab the rest.
 */
export async function fetchFilms(
  letterboxdPath: string,
  options: {
    head?: boolean;
    preferLetterboxdPosters?: boolean;
  } = { preferLetterboxdPosters: false },
): Promise<StremioMetaPreview[]> {
  const log = logBase.extend("fetch");

  // early exit, don't continue if the username doesn't match what we expect
  log(`[${letterboxdPath}] Checking path`);
  if (!LetterboxdUsernameOrListRegex.test(letterboxdPath)) {
    log(`[${letterboxdPath}] path invalid`);
    return [];
  }

  const fetchFreshData = async () => {
    const logFresh = log.extend("fresh");
    try {
      // TODO: Remove later
      if (
        !letterboxdPath.startsWith("_internal_") &&
        !doesLetterboxdResourceExist(letterboxdPath)
      ) {
        throw Error(`[${letterboxdPath}]: does not exist.`);
      }

      const generatedURL = generateURL(letterboxdPath);
      logFresh(`GeneratedURL: ${generatedURL}`);
      const rawHtml = await (await addonFetch(generatedURL)).text();
      const $ = cheerio(rawHtml);

      let pages = +$(".paginate-page").last().text();
      if (pages > env.ADDON_MAX_PAGES_FETCHED) {
        logFresh(
          `Pages detected: ${pages}, rounding down to ${env.ADDON_MAX_PAGES_FETCHED}`,
        );
        pages = env.ADDON_MAX_PAGES_FETCHED;
      }
      if (pages === 0) pages = 1;
      if (options.head) {
        logFresh('"head" passed, only fetching 1 page');
        pages = 1;
      }
      logFresh(`[${letterboxdPath}] has ${pages} pages`);

      // full data will go in here
      let metasToReturn: Awaited<ReturnType<typeof fetchFilms>> = [];
      // grab the pages
      const promises = [];
      for (let page = 1; page <= pages; page++) {
        promises.push(fetchFilmsSinglePage(letterboxdPath, { page }));
      }
      // const results = await Promise.allSettled(promises);
      const results = await Promise.all(promises.splice(0, 1));

      while (promises.length) {
        // 10 pages at a time (280 movies at a time)
        results.push(...(await Promise.all(promises.splice(0, 10))));
      }

      results.sort((a, b) => {
        if (!a.page || !b.page) return 0;
        return a.page - b.page;
      });

      for (const result of results) {
        metasToReturn = [...metasToReturn, ...result.films];
      }

      /* async */ upsertLetterboxdUserWithMovies(letterboxdPath, metasToReturn)
        .then((user) =>
          logFresh(
            `[${letterboxdPath}]: updated user ${letterboxdPath}. ${
              user.updatedAt
            } with ${(JSON.parse(user.movie_ids) as string[]).length} movies.`,
          ),
        )
        .catch((err) => logFresh(err));

      // if we/the user prefer letterboxd posters, use those instead
      logFresh(
        `[${letterboxdPath}] prefer letterboxd posters? ${options.preferLetterboxdPosters}`,
      );

      return metasToReturn;
    } catch (error) {
      log(error);
      return [];
    }
  };

  const cachedStartTime = Date.now();
  // if we have a cached user, serve that and update in the background for _-sPeEd-_
  try {
    const cachedUser = await getDBCachedUser(letterboxdPath);
    log(`[${letterboxdPath}]: ${cachedUser ? "got" : "couldnt get"} cached`);
    // if (options.preferLetterboxdPosters) {
    //   cachedUser = replaceMetaWithLetterboxdPosters(
    //     cachedUser.movies
    //   );
    // }

    const cached_movies = await getCinemetaInfoMany(
      JSON.parse(cachedUser.movie_ids) as string[],
    );

    // if less than 1 page, just fetch a fresh set of data
    if (cached_movies.length <= 30) {
      throw Error("Small cache, get a new set of data.");
    }

    const freshStartTime = Date.now();
    /* async */ fetchFreshData()
      .then((data) => {
        log(`Fetched fresh data -> ${data.length} films`);
        if (!cachedUser)
          return {
            source: "fresh",
            ...data,
          };

        log(
          `[${letterboxdPath}] fresh data fetched in ${formatTimeBetween(
            freshStartTime,
            Date.now(),
          )} seconds`,
        );
        return;
      })
      .catch((error) => {
        log("couldnt fetch fresh data after serving cached data");
        log(error);
      });

    log(
      `[${letterboxdPath}] cached time: ${formatTimeBetween(
        cachedStartTime,
        Date.now(),
      )}`,
    );
    return cached_movies;
  } catch (error) {
    log(`[${letterboxdPath}]: No user or old data, continuing..`);
  }

  // if we don't then fetch fresh
  const freshData = await fetchFreshData();

  return freshData;
}
