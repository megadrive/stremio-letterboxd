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
const app = express();

const __dirname = path.resolve(path.dirname(""));

const PORT = process.env.PORT || 3030;

app.use(cors());

app.get("/", (_req, res) => {
  return res.redirect("/configure");
});

app.get("/logo.png", (_req, res) => {
  return res.sendFile(join(__dirname, "/static/logo.png"));
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
  const name = `${!env.isProduction ? "Dev - " : ""}${idInfo.username} - ${
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
      : `${idInfo.username}'s list: ${idInfo.listName}`
  }`;
  cloned_manifest.description = `Provides ${idInfo.username}'s ${
    idInfo.listName
  } ${idInfo.type !== "watchlist" ? "list " : ""}as a catalog.`;
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
      throw Error(`[${username}]: doesn't exist`);
    }

    const films = await fetchWatchlist(decodeURIComponent(username));
    films.source = undefined; // make sure it can be cached.

    if (env.isProduction) {
      res.appendHeader(
        "Cache-Control",
        "stale-while-revalidate=3600, max-age=43200, public"
      );
    } else {
      res.appendHeader("Cache-Control", "no-cache, public");
    }
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
 * @deprecated
 */
app.get("/generate/:url", (req, res) => {
  const id = parseLetterboxdURLToID(decodeURIComponent(req.params.url));

  res.send(id);
});

/**
 * Redirects a Letterboxd poster, setting the Referer header.
 *
 * @todo will be used when letterboxd posters later
 */
app.get("/poster/:poster_url", async (req, res) => {
  res.appendHeader("Referer", "https://letterboxd.com/");
  res.redirect(req.params.poster_url);
});

/**
 * Checks username or list validity on Letterboxd.
 * Expects :id to be in the format `username(|listid)?`
 *
 * @todo may be used later when verifying urls on /configure
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
