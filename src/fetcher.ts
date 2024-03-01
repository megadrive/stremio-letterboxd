import { addonFetch } from "./lib/fetch.js";
import { load as cheerio } from "cheerio";
import { prisma } from "./prisma.js";
import {
  type CinemetaMovieResponseLive,
  type StremioMetaPreview,
  config,
  LetterboxdRegex,
  LetterboxdUsernameOrListRegex,
} from "./consts.js";
import {
  generateURL,
  doesLetterboxdListExist,
  isOld,
  formatTimeBetween,
} from "./util.js";
import { findMovie } from "./lib/cinemeta.js";

type IFilm = {
  slug: string;
  name?: string;
  year?: string;
  poster?: string;
};

/** Gets an IMDB ID from a film */
// async function getImdbID(film: IFilm) {
//   const query = `${film.slug} ${
//     film.year && !/(19|2[0-9])[0-9]{2,}/.test(film.slug) ? film.year : ""
//   }`.replace(/ +/g, " ");

//   // attempt override for early exit
//   const override = applyOverride(query);
//   if (override) {
//     return override;
//   }

//   let id = await nameToImdb({
//     name: query,
//     type: "movie",
//   });
//   console.info(`Found ${id} from ${query}`);
//   if (!id) {
//     console.warn(`No IMDB ID found: ${query}`);
//     console.info(`Trying for a short`);
//     id = await nameToImdb({
//       name: query,
//       type: "short",
//     });
//     if (!id) {
//       return undefined;
//     }
//     console.info(`Found ${id} from ${query} as a short`);
//   }

//   return id;
// }

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
  const IDs = [];
  for (const film of films) {
    const query = `${film.name}`;
    const matches = findMovie(query);

    if (matches.length === 0) {
      console.warn(`Couldn't find ${query}`);
      continue;
    }

    if (matches[0].name !== query) {
      console.warn(`Couldn't find ${query}`);
      continue;
    }

    let topMatch = matches[0];

    if (matches[0].name.toLowerCase() === query.toLowerCase()) {
      console.info(`Found ${query}, checking for duplicates.`);
      // do we have multiples with the exact same name? use year
      // this is also _so_ not the best way to do this lol
      let dupe = false;
      for (let x = 1; x < matches.length; x++) {
        if (matches[0].name.toLowerCase() === matches[x].name.toLowerCase()) {
          console.info(`Found a dupe, search more specifically.`);
          dupe = true;
        }
      }

      if (dupe) {
        const moreSpecific = findMovie(`${query} ${film.year}`, {
          boost: { year: 2 },
        });
        moreSpecific.sort((a, b) => b.score - a.score);
        topMatch = moreSpecific[0];
      }
    }

    IDs.push(topMatch.imdb_id);
  }
  return IDs;

  // console.log(`Getting ${films.length} IMDB IDs.`);
  // return Promise.all(films.map(getImdbID));
}

/** Gets Meta information for a single IMDB ID from Cinemeta */
// async function getCinemetaInfo(
//   imdbId: `tt${number}` | string
// ): Promise<StremioMetaPreview> {
//   console.info(`[cinemeta] Getting meta for ${imdbId}`);

//   const res = await addonFetch(
//     // `https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`
//     `https://cinemeta-live.strem.io/meta/movie/${imdbId}.json`
//   );
//   if (res.ok) {
//     const { meta } = (await res.json()) as CinemetaMovieResponseLive;

//     return {
//       id: meta.id,
//       type: meta.type,
//       name: meta.name,
//       poster: meta.poster,
//     };
//   } else {
//     throw Error(`[${imdbId}] failed to get Cinemeta`);
//   }
// }

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
        console.info(`[cinemeta] getting chunk ${rv.length}`);
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

  console.log(user);

  const parsed_movie_ids: string[] = JSON.parse(user.movie_ids);
  console.info(`[${username}]: got ${parsed_movie_ids.length} movie ids`);
  // const movie_info = await getCinemetaInfoMany(parsed_movie_ids);
  const movie_info: StremioMetaPreview[] = [];
  for (const imdbid of parsed_movie_ids) {
    const found = findMovie(imdbid);
    console.log({ found });
    movie_info.push({
      id: found[0].imdb_id,
      name: found[0].name,
      type: "movie",
      poster: found[0].poster,
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
    const url = `https://letterboxd.com/ajax/poster/film/${letterboxdSlug}/std/125x187/?k=`;
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

  // Attempt to get the year of release from the detail page
  const filmSlugs_and_years = await Promise.all(
    filmSlugs
      .filter((slug) => !!slug)
      .map(async (slug) => {
        const filmInfo = await getFilmDataFromLetterboxd(
          typeof slug === "string" ? slug.replace(/ /g, "-") : `${slug}`
        );
        return {
          ...filmInfo,
          slug,
        };
      })
  );

  console.info(
    `[${username}] got ${filmSlugs_and_years.length} data from letterboxd`
  );

  const imdbIds = await getImdbIDs(filmSlugs_and_years);
  const films_with_metadata = await getCinemetaInfoMany(imdbIds);

  console.info(`[${username}] got ${films_with_metadata.length} imdb IDs`);

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
  letterboxdId: string,
  options: {
    preferLetterboxdPosters?: boolean;
  } = { preferLetterboxdPosters: false }
): Promise<{
  source?: "fresh" | "cache";
  metas: Awaited<
    ReturnType<typeof fetchWatchlistPage> & { elapsed: Date["toString"] }
  >;
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
        throw Error(`[${letterboxdId}}: Letterboxd user does not exist.`);

      const rawHtml = await (
        await addonFetch(generateURL(letterboxdId))
      ).text();
      const $ = cheerio(rawHtml);

      const pages = +$(".paginate-page").last().text();
      console.info(`[${letterboxdId}] has ${pages} pages on their watchlist`);

      // grab the first page
      const filmsFromWatchlist = await fetchWatchlistPage(letterboxdId, {
        preferLetterboxdPosters: false,
      });

      // full data will go in here
      const metaToReturn: Awaited<ReturnType<typeof fetchWatchlist>> = {
        metas: filmsFromWatchlist,
      };

      for (let page = 2; page <= pages; page++) {
        let newPage = await fetchWatchlistPage(letterboxdId, { page });
        metaToReturn.metas = [...metaToReturn.metas, ...newPage];
      }

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
            `[${letterboxdId}]: updated user @ ${user.updatedAt} with ${
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
      JSON.parse(cachedUser.movie_ids)
    );

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
    console.error(error);
  }

  // if we don't then fetch fresh
  const freshData = await fetchFreshData();

  return freshData;
}
