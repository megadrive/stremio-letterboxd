import { config as dotenv } from "dotenv";
dotenv();

import manifest, { type ManifestExpanded } from "./manifest.js";
import cors from "cors";
import express from "express";
import { fetchFilms, fetchFilmsSinglePage } from "./fetcher.js";
import {
  convertHTMLEntities,
  doesLetterboxdResourceExist,
  parseExtrasFromCatalogRequest,
} from "./util.js";
import { env } from "./env.js";
import { parseLetterboxdURLToID } from "./util.js";
import { lruCache } from "./lib/lruCache.js";
import { parseConfig } from "./lib/config.js";
import { replacePosters } from "./providers/letterboxd.js";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";
import type { StremioMeta, StremioMetaPreview } from "./consts.js";
import { HTTP_CODES } from "./consts.js";
import { publishToCentral } from "./lib/publishToStremioOfficialRepository.js";
import { ListManager } from "./providers/listManager.js";

const listManager = new ListManager();
listManager.startPolling();

const app = express();

const logBase = logger("server");

if (env.isProd || env.isProduction) {
  publishToCentral("https://letterboxd.almosteffective.com/").then(() => {
    logBase(
      `Published to stremio official repository as ${manifest.name} with ID ${manifest.id} and version ${manifest.version}`
    );
  });
} else {
  logBase("Not in Production, not publishing to stremio official repository");
}

const PORT = env.PORT;

app.use(cors());
app.use(express.static("dist/public"));

function toStremioMetaPreview(metas: StremioMeta[]): StremioMetaPreview[] {
  return metas.map((film) => {
    return {
      id: film.id,
      type: film.type,
      name: film.name,
      poster: film.poster,
    };
  });
}

/** Recommends a list */
app.get("/recommend", async (_req, res) => {
  const recommendedList = listManager.recommend();
  if (!recommendedList) return res.status(HTTP_CODES.NOT_FOUND).send();
  return res.status(HTTP_CODES.OK).json(recommendedList);
});

/** Redirects to /configure */
app.get("/", (_req, res) => {
  return res.redirect("/configure");
});

/** Redirects to /configure with provided config */
app.get("/:id/configure", (req, res) => {
  const base = !env.isProduction ? "http://localhost:4321/" : "";

  return res.redirect(
    `${base}/configure?id=${encodeURIComponent(req.params.id)}`
  );
});

/** Provide a base Manifest.json for Stremio Community and Stremio Unofficial Addons */
app.get("/manifest.json", (_req, res) => {
  const cloned_manifest = Object.assign({}, manifest);
  // set these to true as the addon is configured yet.
  cloned_manifest.behaviorHints = {
    configurable: true,
    configurationRequired: true,
  };
  // cloned_manifest.description =
  //   "!! Letterboxd requires configuration! Click Configure instead or go to https://letterboxd.almosteffective.com/ !!";
  res.setHeader("Content-Type", "application/json");
  res.json(cloned_manifest);
});

/** Provide a manifest for the provided config. */
app.get("/:providedConfig/manifest.json", async (req, res) => {
  const log = logBase.extend("manifest");
  const { providedConfig } = req.params;
  let cachedConfig:
    | Awaited<ReturnType<typeof prisma.config.findFirstOrThrow>>
    | undefined = undefined;
  try {
    cachedConfig = await prisma.config.findFirstOrThrow({
      where: {
        id: providedConfig,
      },
    });
  } catch (error) {
    log("No config found for providedConfig", providedConfig);
    log(error);
  }
  const config = parseConfig(
    cachedConfig ? cachedConfig.config : providedConfig
  );
  if (!config) {
    return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json();
  }

  const cloned_manifest = JSON.parse(
    JSON.stringify(manifest)
  ) as ManifestExpanded;
  cloned_manifest.id = `${
    env.isDevelopment ? "dev-" : ""
  }com.github.megadrive.letterboxd-watchlist-${providedConfig}`;
  cloned_manifest.name = `Letterboxd - ${config.catalogName}`;

  cloned_manifest.description = `Provides a list of films at https://letterboxd.com${config.path} as a catalog.`;

  cloned_manifest.catalogs = [
    {
      id: config.path,
      /** @ts-ignore next-line */
      type: "letterboxd",
      name: convertHTMLEntities(config.catalogName),
      extra: [
        {
          name: "skip",
          isRequired: false,
        },
      ],
    },
  ];

  return res.json(cloned_manifest);
});

/** Provide the catalog for the provided config. */
app.get("/:providedConfig/catalog/:type/:id/:extra?", async (req, res) => {
  /**
   *
   * @param code
   * @param message
   * @returns Empty JSON with the provided message
   */
  const resError = (
    code: (typeof HTTP_CODES)[keyof typeof HTTP_CODES],
    message: string
  ) => {
    res.setHeader(
      "Cache-Control",
      "max-age=60, stale-while-revalidate=30, s-maxage=60"
    );
    return res.status(code).json({ message, metas: [] });
  };

  res.setHeader(
    "Cache-Control",
    `max-age=3600, stale-while-revalidate=${3600 / 2}, s-maxage=3600`
  );

  // We would use {id} if we had more than one list.
  const { providedConfig, type, id, extra } = req.params;
  const parsedExtras = parseExtrasFromCatalogRequest(extra);
  console.log({ parsedExtras });
  const log = logBase.extend(`catalog:${id}`);
  let cachedConfig: Awaited<ReturnType<typeof prisma.config.findFirst>>;
  try {
    cachedConfig = await prisma.config.findFirst({
      where: {
        id: providedConfig,
      },
    });
    if (!cachedConfig) {
      log(`No config found for ${providedConfig}, using provided config`);
    }
  } catch (error) {
    log(error);
    return resError(HTTP_CODES.INTERNAL_SERVER_ERROR, "No config found");
  }
  // if we have a cacched config, use it, otherwise use the provided one
  const config = parseConfig(
    cachedConfig ? cachedConfig.config : providedConfig
  );

  const username = config.username;

  const consoleTime = `[${config.path}] catalog`;
  console.time(consoleTime);

  // We still keep movie here for legacy purposes, so legacy users don't break.
  if (type !== "movie" && type !== "letterboxd") {
    log(`Wrong type: ${type}, giving nothing.`);
    return resError(HTTP_CODES.BAD_REQUEST, "Wrong type");
  }

  try {
    if ((await doesLetterboxdResourceExist(config.path)) === false) {
      log(`${config.path} doesn't exist`);
      return resError(HTTP_CODES.NOT_FOUND, "Not found");
    }

    const sCache = lruCache.get(config.pathSafe);
    if (!sCache) {
      log(`No cache found for ${username}`);
    }

    /**
     * Letterboxd pages have different amounts of films depending on the page,
     * so we need to figure out the page based on the films.
     */
    let pageToFetch = 0;
    if (parsedExtras?.skip) {
      const skip = +parsedExtras.skip; // convert to number

      const skipAmts = {
        watchlist: 28,
        list: 100,
      } as const;

      log(`skipping ${skip} films`);
      if (config.type === "watchlist") {
        pageToFetch = Math.ceil(skip / skipAmts.watchlist);
      } else {
        pageToFetch = Math.ceil(skip / skipAmts.list);
      }
      pageToFetch++;

      console.info({ type: config.type, skip, pageToFetch });
    }

    const singlePageOfFilms = await fetchFilmsSinglePage(config.path, {
      page: pageToFetch,
    });
    let films = singlePageOfFilms.films;

    console.warn("``````````````````````````````````````````````````");
    console.error(config);
    if (config.posterChoice) {
      switch (config.posterChoice) {
        case "cinemeta":
          console.log(`Leaving Cinemeta posters for ${config.path}`);
          break;
        case "letterboxd":
          console.log(`Replacing Letterboxd posters for ${config.path}`);
          films = await replacePosters(films);
          break;
        case "letterboxd-ratings":
          console.log(`Replacing Letterboxd ratings for ${config.path}`);
          films = await replacePosters(films, { ratings: true });
          break;
        case "rpdb":
          {
            console.log(`Replacing RPDB posters for ${config.path}`);
            console.log({ config });
            const apiKey = config.rpdbApiKey ?? env.ADDON_RPDB_APIKEY;
            films = films.map((film) => {
              film.poster = `https://api.ratingposterdb.com/${apiKey}/imdb/poster-default/${film.id}.jpg`;
              return film;
            });
          }
          break;
      }
    }
    console.warn("``````````````````````````````````````````````````");

    log(`[${config.path}] serving fresh`);
    log(`[${config.path}] serving ${films.length}`);
    console.timeEnd(consoleTime);

    // limit what we return, to limit the amount of data we send to the user
    if (!env.ADDON_FULL_METADATA) {
      log("Limiting metas to Stremio metas");
      const filmsPreviewData = toStremioMetaPreview(films);
      return res.json({ metas: filmsPreviewData });
    }

    return res.json({ metas: films });
  } catch (error) {
    // Return empty
    log(error);
    console.timeEnd(consoleTime);
    return resError(
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      error?.message ?? "Internal error"
    );
  }
});

/** Get the cached config for the provided config ID. */
app.get("/getConfig/:id", async (req, res) => {
  const log = logBase.extend("getConfig");
  let cachedConfig: Awaited<ReturnType<typeof prisma.config.findFirst>>;
  try {
    cachedConfig = await prisma.config.findFirst({
      where: {
        id: req.params.id,
      },
    });
    const config = parseConfig(
      cachedConfig ? cachedConfig.config : req.params.id
    );
    // cache for 1 day, should very rarely change anyway
    res.setHeader("Cache-Control", "max-age=86400");
    return res.json(config);
  } catch (error) {
    log(error);
    res.setHeader(
      "Cache-Control",
      "max-age=60, stale-while-revalidate=30, s-maxage=60"
    );
    return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send();
  }
});

/**
 * Verifies and creates a config for the provided string.
 *
 * Bas64 encoded JSON.stringified object:
 * {url: string, posters: boolean, base: string, customListName: string}
 */
app.get("/verify/:base64", async (req, res) => {
  const ERROR_CODES = {
    NO_URL: 1,
    NO_BASE: 2,
    BAD_URL: 3,
    CATASTROPHIC: 100,
  } as const;

  type VerifyConfig = {
    url: string;
    base: string;
    posters: boolean;
    customListName: string;
    ignoreUnreleased: boolean;
    posterChoice: "cinemeta" | "letterboxd" | "rpdb";
    rpdbApiKey?: string;
  };
  const log = logBase.extend("verify");
  // Resolve config
  const base64 = req.params.base64;
  let decoded: string;
  let userConfig: VerifyConfig;
  try {
    decoded = atob(base64);
    log({ decoded });
    userConfig = JSON.parse(decoded) as VerifyConfig;
  } catch {
    log("Could not convert base64 to string or convert to userConfig", base64);
    return res
      .status(HTTP_CODES.INTERNAL_SERVER_ERROR)
      .json(`Error code ${ERROR_CODES.CATASTROPHIC}`);
  }

  log("Got userconfig:", userConfig);

  // Early exit if no url provided
  if (!userConfig.url || userConfig.url.length === 0) {
    log("no url in userconfig");
    return res
      .status(HTTP_CODES.BAD_REQUEST)
      .json(`Error code ${ERROR_CODES.NO_URL}`);
  }

  // Ensure it's a whitelisted domain
  const whitelistedDomains = ["letterboxd.com", "boxd.it"];
  try {
    if (!whitelistedDomains.includes(new URL(userConfig.url).hostname)) {
      log("URL is not whitelisted");
      throw new Error(`Error code ${ERROR_CODES.BAD_URL}`);
    }
  } catch (error) {
    log("URL is not whitelisted");
    return res
      .status(HTTP_CODES.BAD_REQUEST)
      .json(`Error code ${ERROR_CODES.BAD_URL}`);
  }

  // Ensure URLs are only allowed
  if (
    !userConfig.url.startsWith("https://letterboxd.com/") &&
    !userConfig.url.startsWith("https://boxd.it/")
  ) {
    log("URL is not a letterboxd url");
    return res.status(500).json(`Error code ${ERROR_CODES.BAD_URL}`);
  }

  // Resolve final URL (boxd.it -> letterboxd)
  if (userConfig.url.startsWith("https://boxd.it/")) {
    log("converting boxd.it url");
    try {
      const fetchRes = await fetch(userConfig.url, { redirect: "follow" });
      if (!fetchRes.ok) {
        log(`couldn't resolve boxd.it url`);
        return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json();
      }
      userConfig.url = fetchRes.url;
    } catch (error) {
      log(`couldn't resolve boxd.it url: ${error.message}`);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error.message);
    }
  }

  const path = new URL(userConfig.url).pathname;

  // see if we already have an ID for this letterboxd path
  const cachedConfig = await prisma.config.findFirst({
    where: {
      config: encodeURIComponent(path),
    },
  });

  if (cachedConfig) {
    log("Serving cached config with long max-age");
    res.setHeader(
      "Cache-Control",
      "max-age=86400, stale-while-revalidate=3600"
    );
    return res
      .status(HTTP_CODES.OK)
      .json(`${userConfig.base}/${cachedConfig.id}/manifest.json`);
  }

  const opts = [];
  if (userConfig.posterChoice) {
    opts.push(`p=${userConfig.posterChoice}`);
  } else {
    // cinemeta is the default, set if omitted for some reason
    opts.push("p=cinemeta");
  }
  if (opts.includes("p=rpdb") && userConfig.rpdbApiKey) {
    opts.push(`rpdb=${userConfig.rpdbApiKey}`);
  }
  if (userConfig.ignoreUnreleased) {
    opts.push("iu");
  }
  if (userConfig?.customListName?.length) {
    opts.push(`cn=${userConfig.customListName}`);
  } else {
    try {
      const nameRes = await fetch(userConfig.url);
      if (!nameRes.ok) {
        throw Error(`Couldn't get URL`);
      }
      const html = await nameRes.text();
      const rogname = /<meta property="og:title" content="(.+)" \/>/;
      const title = rogname.exec(html);
      if (!title || title.length === 1) {
        throw Error(`Couldn't get URL`);
      }
      opts.push(`cn=${title[1]}`);
    } catch (error) {
      log(error.message);
    }
  }

  const unencoded = `${path}${opts.length ? `|${opts.join("|")}` : ""}`;
  const config = encodeURIComponent(unencoded);

  // Verify we get metas from the URL
  if (!env.ADDON_SKIP_MANIFEST_VALIDATION) {
    try {
      log(`Verifying list exists: ${userConfig.url}`);
      const listExists = await doesLetterboxdResourceExist(
        userConfig.url,
        true
      );
      if (!listExists) {
        log(`List doesn't exist: ${userConfig.url}`);
        return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json();
      }
    } catch (error) {
      log(`List doesn't exist: ${userConfig.url}`);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json(error.message);
    }
    log(`List exists: ${userConfig.url}`);
  } else {
    log(`Skipping manifest validation: ${userConfig.url}`);
  }

  // exit early if RPDB is not enabled and RPDB has been requested
  if (
    userConfig.posterChoice === "rpdb" &&
    (!env.ADDON_RPDB_APIKEY || env.ADDON_RPDB_APIKEY.length === 0)
  ) {
    log("RPDB is not enabled, exiting early");
    return res
      .status(HTTP_CODES.BAD_REQUEST)
      .send("RPDB is not enabled in the addon.");
  }

  // change protocol to stremio, only if https
  userConfig.base = userConfig.base.startsWith("https")
    ? userConfig.base.replace(/https/, "stremio")
    : userConfig.base;

  const newConfig = await prisma.config.create({
    data: {
      config,
    },
  });

  return res
    .status(HTTP_CODES.OK)
    .json(`${userConfig.base}/${newConfig.id}/manifest.json`);
});

/**
 * Redirects a Letterboxd poster, setting the Referer header.
 *
 * @todo will be used when letterboxd posters later
 */
app.get("/poster/:letterboxdPath/:letterboxdId", async (req, res) => {
  const { letterboxdPath, letterboxdId } = req.params;

  const poster = await prisma.letterboxdPoster.findFirst({
    where: {
      // letterboxdPath: decodeURIComponent(letterboxdPath),
      letterboxdId,
    },
  });
  if (!poster) {
    return res.status(HTTP_CODES.NOT_FOUND).send();
  }
  res.appendHeader("Referer", "https://letterboxd.com/");
  return res.redirect(poster.url);
});

app.get("/rpdb-poster/:imdbId", async (req, res) => {
  const { imdbId } = req.params;
  if (!env.ADDON_RPDB_APIKEY || env.ADDON_RPDB_APIKEY.length === 0 || !imdbId) {
    return res.status(HTTP_CODES.NOT_FOUND).send();
  }

  res.header("Cache-Control", "public, max-age=31536000, immutable");

  return res.redirect(
    `https://api.ratingposterdb.com/${env.ADDON_RPDB_APIKEY}/imdb/poster-default/${imdbId}.jpg`
  );
});

app.get("/stats", async (_req, res) => {
  try {
    const listCount = await prisma.config.count();

    return res.status(HTTP_CODES.OK).json({ lists: listCount });
  } catch (error) {
    return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send();
  }
});

app.listen(PORT, () => {
  console.log(`Stremio-Letterboxd available at http://localhost:${PORT}`);
  console.info("env;", env);
});
