import { config as dotenv } from "dotenv";
dotenv();

import path, { join } from "path";

import manifest, { type ManifestExpanded } from "./manifest.js";
import cors from "cors";
import express from "express";
import { fetchFilms } from "./fetcher.js";
import { doesLetterboxdResourceExist } from "./util.js";
import { env } from "./env.js";
import { parseLetterboxdURLToID } from "./util.js";
import { lruCache } from "./lib/lruCache.js";
import { parseConfig } from "./lib/config.js";
import { replacePosters } from "./providers/letterboxd.js";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";
const app = express();

const logBase = logger("server");

const __dirname = path.resolve(path.dirname(""));

const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.static("static"));

app.get("/", (_req, res) => {
  return res.redirect("/configure");
});

// TODO: Make the new landing page work with provided values.
app.get("/:id?/configure", function (req, res, next) {
  return res.redirect("/configure");
});

app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

/**
 * Create the catalog.
 */
app.get("/:providedConfig/manifest.json", async function (req, res) {
  const log = logBase.extend("manifest");
  const { providedConfig } = req.params;
  let cachedConfig;
  try {
    cachedConfig = await prisma.config.findFirstOrThrow({
      where: {
        id: providedConfig,
      },
    });
  } catch (error) {
    log(error);
    return res.status(500).json();
  }
  const config = parseConfig(cachedConfig.config);

  const cloned_manifest = JSON.parse(
    JSON.stringify(manifest)
  ) as ManifestExpanded;
  cloned_manifest.id = `${
    env.isDevelopment ? "dev-" : ""
  }com.github.megadrive.letterboxd-watchlist-${config.pathSafe}`;
  cloned_manifest.name = `Letterboxd - ${config.catalogName}`;

  cloned_manifest.description = `Provides a list of films at https://letterboxd.com${config.path} as a catalog.`;

  cloned_manifest.catalogs = [
    {
      id: config.path,
      /** @ts-ignore next-line */
      type: "letterboxd",
      name: config.catalogName,
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

// Serve the meta items
app.get("/:providedConfig/catalog/:type/:id/:extra?", async (req, res) => {
  // We would use {id} if we had more than one list.
  const { providedConfig, type, id, extra } = req.params;
  const parsedExtras = (() => {
    if (!extra) return undefined;

    const rextras = /([A-Za-z]+)+=([A-Za-z0-9]+)/g;
    const matched = [...extra.matchAll(rextras)];
    const rv: Record<string, string> = {};
    for (const match of matched) {
      rv[match[1]] = match[2];
    }
    return rv;
  })();
  const log = logBase.extend(`catalog:${id}`);
  let cachedConfig;
  try {
    cachedConfig = await prisma.config.findFirstOrThrow({
      where: {
        id: providedConfig,
      },
    });
  } catch (error) {
    log(error);
    if (!parsedExtras?.letterboxdhead) {
      return res.status(500).json({ metas: [] });
    }
  }
  // if we have a cacched config, use it, otherwise use the provided one
  const config = parseConfig(
    cachedConfig ? cachedConfig.config : providedConfig
  );
  log({ providedConfig, config });
  const username = config.username;

  if (parsedExtras && parsedExtras["letterboxdhead"] === "1") {
    // Perform a HEAD-style request to confirm the resource exists and has at least 1 movie.
    const metas = await fetchFilms(config.path, { head: true });
    return res.status(200).json(metas);
  }

  const consoleTime = `[${config.path}] catalog`;
  console.time(consoleTime);

  // We still keep movie here for legacy purposes, so current users don't break.
  if (type !== "movie" && type !== "letterboxd") {
    log(`Wrong type: ${type}, giving nothing.`);
    return res.status(304).json({ metas: [] });
  }

  try {
    if ((await doesLetterboxdResourceExist(config.path)) === false) {
      log(`${config.path} doesn't exist`);
      return res.status(404).send();
    }

    const sCache = lruCache.get(config.pathSafe);
    if (!sCache) {
      log(`No cache found for ${username}`);
    }

    // slice is zero based, stremio is 1 based
    const paginate = (arr: unknown[], skip?: number): unknown[] => {
      const amt = parsedExtras?.skip ? +parsedExtras.skip + 99 : 199;
      if (!skip) {
        skip = +(parsedExtras?.skip ?? 0);
      }
      const sliced = arr.slice(skip, amt);
      return sliced;
    };

    if (sCache) {
      log("serving cached");
      res.setHeader("Content-Type", "application/json");
      let metas: typeof sCache = sCache;

      if (config.posters) {
        log(`Replacing Letterboxd posters for ${config.path}`);
        metas = await replacePosters(sCache);
      }

      console.timeEnd(consoleTime);
      return res.json({
        count: metas.length,
        metas: paginate(metas),
      });
    }

    const films = await fetchFilms(config.path, {
      head: Boolean(parsedExtras?.letterboxdhead),
    });

    // limit what we return, to limit the amount of data we send to the user
    // @ts-ignore LOL. I know. FIX THIS LATER
    films.metas = films.metas.map((film) => {
      return {
        id: film.id,
        type: film.type,
        name: film.name,
        poster: film.poster,
      };
    });

    if (!parsedExtras?.letterboxdhead) {
      lruCache.save(config.pathSafe, films.metas);
    }

    if (config.posters) {
      log(`Replacing Letterboxd posters for ${config.path}`);
      films.metas = await replacePosters(films.metas);
    }

    log(`[${config.path}] serving fresh`);
    log(`[${config.path}] serving ${films.metas.length}`);
    console.timeEnd(consoleTime);
    return res.json({ metas: paginate(films.metas) });
  } catch (error) {
    // Return empty
    log(error);
    console.timeEnd(consoleTime);
    return res.json({ metas: [] });
  }
});

/**
 * Unused.
 * .deprecated
 */
app.get("/generate/:url", (req, res) => {
  const id = parseLetterboxdURLToID(decodeURIComponent(req.params.url));

  res.send(id);
});

/**
 * Bas64 encoded JSON.stringified object:
 * {url: string, posters: boolean, base: string, customListName: string}
 */
app.get("/verify/:base64", async (req, res) => {
  const log = logBase.extend("verify");
  // Resolve config
  const { base64 } = req.params;
  let decoded;
  let userConfig;
  try {
    decoded = atob(base64);
    log({ decoded });
    userConfig = JSON.parse(decoded) as {
      url: string;
      base: string;
      posters: boolean;
      customListName: string;
    };
  } catch {
    log(`Could not convert base64 to string or convert to userConfig`, base64);
    return res.status(500).json();
  }

  log(`Got userconfig:`, userConfig);

  // Early exit if no url provided
  if (!userConfig.url || userConfig.url.length === 0) {
    log(`no url in userconfig`);
    return res.status(500).send();
  }

  // Resolve final URL (boxd.it -> letterboxd)
  if (userConfig.url.startsWith("https://boxd.it/")) {
    log(`converting boxd.it url`);
    try {
      const fetchRes = await fetch(userConfig.url, { redirect: "follow" });
      if (!fetchRes.ok) {
        log(`couldn't resolve boxd.it url`);
        return res.status(500).json();
      }
      userConfig.url = fetchRes.url;
    } catch (error) {
      log(`couldn't resolve boxd.it url: ${error.message}`);
      return res.status(500).json(error.message);
    }
  }

  const path = new URL(userConfig.url).pathname;
  const opts = [];
  if (userConfig.posters) {
    opts.push("p");
  }
  if (userConfig.customListName && userConfig.customListName.length) {
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

  const unencoded = `${path}${opts.length ? `|${opts}` : ""}`;
  const config = encodeURIComponent(unencoded);

  // Verify we get metas from the URL
  try {
    const catalogUrl = `${userConfig.base}/${encodeURIComponent(
      config
    )}/catalog/letterboxd/${encodeURIComponent(path)}/letterboxdhead=1.json`;
    log(`Can get metas? ${catalogUrl}`);
    const fetchRes = await fetch(catalogUrl);
    if (!fetchRes.ok) {
      log(`Couldn't get metas`);
      return res.status(500).json();
    }
  } catch (error) {
    log(`Couldn't get metas`);
    return res.status(500).json(error.message);
  }
  log(`Got metas!`);

  // change protocol to stremio, only if https
  userConfig.base = userConfig.base.startsWith("https")
    ? userConfig.base.replace(/https/, "stremio")
    : userConfig.base;

  const cachedConfig = await prisma.config.create({
    data: {
      config,
    },
  });

  return res
    .status(200)
    .json(`${userConfig.base}/${cachedConfig.id}/manifest.json`);
});

app.get("/url/:url", async (req, res) => {
  const { url } = req.params;
  let letterboxdUrl = decodeURIComponent(url);

  if (!letterboxdUrl) return res.status(404).send();
  try {
    const urlRes = await fetch(letterboxdUrl, { redirect: "follow" });
    // failure, bad boxd.it url returns the same url
    if (
      !urlRes.url.includes("letterboxd.com") ||
      urlRes.url === letterboxdUrl
    ) {
      return res.status(404).send();
    }
    return res.status(200).json(urlRes.url);
  } catch {
    console.warn(`Couldn't parse Boxd.it URL ${letterboxdUrl}`);
  }

  return res.status(500).send();
});

/**
 * Redirects a Letterboxd poster, setting the Referer header.
 *
 * .todo will be used when letterboxd posters later
 */
app.get("/poster/:poster_url", async (req, res) => {
  res.appendHeader("Referer", "https://letterboxd.com/");
  res.redirect(req.params.poster_url);
});

/**
 * Checks username or list validity on Letterboxd.
 * Expects :id to be in the format `username(|listid)?`
 *
 * .todo may be used later when verifying urls on /configure
 */
app.get("/check/:id", async (req, res) => {
  const [username, listId] = req.params.id.split("|");
  const url = `https://letterboxd.com/${username}${
    listId ? `/list/${listId}` : ""
  }`;
  const fres = await fetch(url, {
    headers: {
      Referer: "https://letterboxd.com/",
    },
  });
  res.status(fres.ok ? 200 : 404).end("");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
