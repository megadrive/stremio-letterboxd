import { config as dotenv } from "dotenv";
dotenv();

import path, { join } from "path";

import manifest, { type ManifestExpanded } from "./manifest.js";
import cors from "cors";
import express from "express";
import { fetchFilms } from "./fetcher.js";
import { doesLetterboxdResourceExist } from "./util.js";
import { env } from "./env.js";
import landingTemplate from "./landingTemplate.js";
import { parseLetterboxdURLToID } from "./util.js";
import { lruCache } from "./lib/lruCache.js";
import { parseConfig } from "./lib/config.js";
import { replacePosters } from "./providers/letterboxd.js";
const app = express();

const __dirname = path.resolve(path.dirname(""));

const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.static("static"));

app.get("/", (_req, res) => {
  return res.redirect("/configure");
});

// TODO: Make the new landing page work with provided values.
app.get("/:id?/configure", function (req, res, next) {
  const { id } = req.params;
  const cloned_manifest = Object.assign({}, manifest);
  if (cloned_manifest.config && cloned_manifest.config[0]) {
    cloned_manifest.config[0].default = id;
  }
  const landingPage = landingTemplate(manifest);
  res.setHeader("Content-Type", "text/html");
  res.end(landingPage);
});

app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

/**
 * Create the catalog.
 */
app.get("/:providedConfig/manifest.json", async function (req, res) {
  const { providedConfig } = req.params;
  const config = parseConfig(providedConfig);

  // TODO: Fix this.
  let catalogName = `${config.username} - ${config.type}`;

  const cloned_manifest = JSON.parse(
    JSON.stringify(manifest)
  ) as ManifestExpanded;
  cloned_manifest.id = `${
    env.isDevelopment ? "dev-" : ""
  }com.github.megadrive.letterboxd-watchlist-${config.pathSafe}`;
  cloned_manifest.name = `Letterboxd - ${config.name} ${config.type}`;

  cloned_manifest.description = `Provides the list at https://letterboxd.com${config.path} as a catalog.`;

  cloned_manifest.catalogs = [
    {
      id: config.path,
      /** @ts-ignore next-line */
      type: "letterboxd",
      name: catalogName,
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
  const config = parseConfig(providedConfig);
  console.log({ providedConfig, config });
  const username = config.username;
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
  console.info({ parsedExtras });

  console.time(`[${config.path}] catalog`);

  // We still keep movie here for legacy purposes, so current users don't break.
  if (type !== "movie" && type !== "letterboxd") {
    console.warn(`Wrong type: ${type}, giving nothing.`);
    return res.status(304).json({ metas: [] });
  }

  try {
    if ((await doesLetterboxdResourceExist(config.path)) === false) {
      console.warn(`[${config.path}]: doesn't exist`);
      return res.status(404).send();
    }

    const sCache = lruCache.get(config.pathSafe);
    if (!sCache) {
      console.warn(`No cache found for ${username}`);
    }

    // slice is zero based, stremio is 1 based
    const paginate = (arr: unknown[], skip?: number): unknown[] => {
      const amt = parsedExtras?.skip ? +parsedExtras.skip + 99 : 199;
      if (!skip) {
        skip = +(parsedExtras?.skip ?? 0);
      }
      const sliced = arr.slice(skip, amt);
      console.info(
        sliced.length,
        // @ts-ignore
        sliced.map((s) => s.name)
      );
      return sliced;
    };

    if (sCache) {
      console.info("serving cached");
      res.setHeader("Content-Type", "application/json");
      let metas: typeof sCache = [];

      if (config.posters) {
        console.info(`Replacing Letterboxd posters for ${config.path}`);
        metas = await replacePosters(sCache);
      }

      return res.json({
        count: metas.length,
        metas: paginate(metas),
      });
    }

    const films = await fetchFilms(config.path);

    lruCache.save(
      config.pathSafe,
      films.metas.map((film) => film.id)
    );

    if (config.posters) {
      console.info(`Replacing Letterboxd posters for ${config.path}`);
      films.metas = await replacePosters(films.metas);
    }

    console.info(`[${config.path} serving fresh]`);
    console.info(`[${config.path}] serving ${films.metas.length}`);
    console.timeEnd(`[${config.path}] catalog`);
    return res.json({ metas: paginate(films.metas) });
  } catch (error) {
    // Return empty
    console.error(error);
    console.timeEnd(`[${config.path}] catalog`);
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

app.get("/url/:letterboxdUrl", async (req, res) => {
  const { letterboxdUrl } = req.params;

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
