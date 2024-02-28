import { config as dotenv } from "dotenv";
dotenv();

import path, { join } from "path";

import manifest, { type ManifestExpanded } from "./manifest.js";
import cors from "cors";
import express from "express";
import { fetchWatchlist } from "./fetcher.js";
import { doesLetterboxdUserExist } from "./util.js";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import landingTemplate from "./landingTemplate.js";
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

app.get("/configure", function (_req, res, next) {
  const landingPage = landingTemplate(manifest);
  res.setHeader("Content-Type", "text/html");
  res.end(landingPage);

  // return res.sendFile(join(__dirname, "/static/index.html"));
});

app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(manifest);
});

// Create the catalog
app.get("/:username/manifest.json", async function (req, res) {
  const cloned_manifest = JSON.parse(
    JSON.stringify(manifest)
  ) as ManifestExpanded;
  cloned_manifest.id = `${
    !env.isProduction ? "dev." : ""
  }com.github.megadrive.letterboxd-watchlist-${req.params.username}`;
  cloned_manifest.name = `${
    !env.isProduction ? "Dev - " : ""
  }Letterboxd Watchlist - ${req.params.username}`;
  cloned_manifest.description = `Provides ${req.params.username}'s watchlist as a catalog.`;
  cloned_manifest.catalogs = [
    {
      id: req.params.username,
      type: "movie",
      name: `${!env.isProduction ? "dev - " : ""}${
        req.params.username
      } - Letterboxd Watchlist`,
    },
  ];

  return res.json(cloned_manifest);
});

// Serve the meta items
app.get("/:username/catalog/:type/:id/:extra?", async (req, res) => {
  // We would use {id} if we had more than one list.
  const { username, type, id, extra } = req.params;
  console.log({ extra });

  if (type !== "movie") {
    return res.status(304).json({ metas: [] });
  }

  try {
    if (!doesLetterboxdUserExist(decodeURIComponent(username))) {
      throw Error(`[${username}]: doesn't exist`);
    }
    const films = await fetchWatchlist(decodeURIComponent(username));
    films.source = undefined; // make sure it can be cached.

    if (env.isProduction) res.appendHeader("Cache-Control", "max-age: 3600");
    return res.json(films);
  } catch (error) {
    // Return empty
    console.error(error);
    return res.json({ metas: [] });
  }
});

app.post("/generate/:username", (req, res) => {
  const { protocol, hostname } = req;
  return res.send(
    `${protocol}://${hostname}/` +
      encodeURIComponent(req.params.username) +
      "/manifest.json"
  );
});

app.get("/poster/:poster_url", async (req, res) => {
  res.appendHeader("Referer", "https://letterboxd.com/");
  res.redirect(req.params.poster_url);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
