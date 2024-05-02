import { config as dotenv } from "dotenv";
dotenv();

import path, { join } from "path";

import manifest, { type ManifestExpanded } from "./manifest.js";
import cors from "cors";
import express from "express";
import { fetchWatchlist } from "./fetcher.js";
import { IDUtil, PrependWithDev, doesLetterboxdListExist } from "./util.js";
import { env } from "./env.js";
import landingTemplate from "./landingTemplate.js";
import { LetterboxdUsernameOrListRegex } from "./consts.js";
import { parseLetterboxdURLToID } from "./util.js";
import { staticCache } from "./lib/staticCache.js";
import { popularLists } from "./popular.js";
const app = express();

const __dirname = path.resolve(path.dirname(""));

const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.static("static"));

app.get("/", (_req, res) => {
  return res.redirect("/configure");
});

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

// Create the catalog
app.get("/:id/manifest.json", async function (req, res) {
  const idInfo = IDUtil.split(req.params.id);
  let name = `${!env.isProduction ? "Dev - " : ""}${idInfo.username} - ${
    idInfo.listName
  }`;

  const cloned_manifest = JSON.parse(
    JSON.stringify(manifest)
  ) as ManifestExpanded;
  cloned_manifest.id = PrependWithDev(
    `com.github.megadrive.letterboxd-watchlist-${idInfo.username}${
      idInfo.listId ? `|${idInfo.listId}` : ""
    }`
  );
  cloned_manifest.name = `Letterboxd - ${
    idInfo.type === "watchlist"
      ? `${idInfo.username} - Watchlist`
      : `${idInfo.listName} - ${idInfo.username}`
  }`;

  if (idInfo.username.startsWith("_internal_")) {
    console.info(popularLists, idInfo);
    const found = popularLists.findIndex((list) => list.id === req.params.id);
    if (found >= 0) {
      name = popularLists[found].name;
      cloned_manifest.name = name;
    }
  }

  cloned_manifest.description = `Provides ${
    idInfo.username === "_internal_" ? "Letterboxd" : idInfo.username
  }'s ${idInfo.listName} ${
    idInfo.type !== "watchlist" ? "list " : ""
  }as a catalog.`;
  cloned_manifest.catalogs = [
    {
      id: req.params.id,
      /** @ts-ignore next-line */
      type: "letterboxd",
      name,
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
app.get("/:username/catalog/:type/:id/:extra?", async (req, res) => {
  // We would use {id} if we had more than one list.
  const { username, type, id, extra } = req.params;
  console.log({ extra });
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

  console.time(`[${username}] catalog`);

  // We still keep movie here for legacy purposes, so current users don't break.
  if (type !== "movie" && type !== "letterboxd") {
    console.warn(`Wrong type: ${type}, giving nothing.`);
    return res.status(304).json({ metas: [] });
  }

  try {
    if (!LetterboxdUsernameOrListRegex.test(username)) {
      throw Error(`[${username}] invalid id`);
    }
    if (
      (await doesLetterboxdListExist(decodeURIComponent(username))) === false
    ) {
      console.warn(`[${username}]: doesn't exist`);
      return res.status(404).send();
    }

    const sCache = await staticCache.get(username);
    if (!sCache) {
      console.warn(`No cache found for ${username}`);
    }
    console.log(
      `[${username}] Static cache expires: ${sCache} exists. ${sCache?.expires} expires`
    );
    const expires = sCache?.expires ? Date.now() - sCache.expires : 0;
    if (env.isProduction) {
      res.appendHeader(
        "Cache-Control",
        `stale-white-revalidate, max-age: ${expires > 3600 ? expires : 3600}`
      );
    }

    if (sCache && expires > 0) {
      console.log(sCache.expires);
      console.info("serving static file");
      res.setHeader("Content-Type", "application/json");
      if (sCache.metas.length < 100) {
        console.info(
          `Cache < 100 (${sCache.metas.length}) or no extra parameters.`
        );
        console.timeEnd(`[${username}] catalog`);
        return res.redirect(
          `/lists/${decodeURIComponent(username).replace(
            /(\||%7C)/g,
            "-"
          )}.json`
        );
      } else {
        console.timeEnd(`[${username}] catalog`);
        const amt = parsedExtras?.skip ? +parsedExtras.skip + 100 : 200;
        console.info({ amt });
        const mutatedArray = [...sCache.metas];
        const metas = mutatedArray.splice(0, amt);

        return res.json({
          count: metas.length,
          metas,
        });
      }
    } else {
      console.warn(
        `Cache exists? ${!!sCache} or out of date, fetching fresh. Expires: ${
          Date.now() - expires < 0
        }.`
      );
    }

    const films = await fetchWatchlist(decodeURIComponent(username));
    films.source = undefined; // make sure it can be cached.
    if (parsedExtras && parsedExtras.skip) {
      films.metas = films.metas.slice(0, +parsedExtras.skip);
    }

    staticCache
      .save(username)
      .then(() => console.info(`[static_cache] saved ${username}`));

    console.info(`[${username}] serving ${films.metas.length}`);
    console.timeEnd(`[${username}] catalog`);
    return res.json(films);
  } catch (error) {
    // Return empty
    console.error(error);
    console.timeEnd(`[${username}] catalog`);
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
  console.log(letterboxdUrl);
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
