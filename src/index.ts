import { config as dotenv } from "dotenv";
dotenv();

import { join } from "path";

import manifest from "./manifest";
import cors from "cors";
import express from "express";
import { watchlist_fetcher } from "./fetcher";
import { type Manifest } from "stremio-addon-sdk";
import { is_prod } from "./consts";
import { does_letterboxd_user_exist } from "./util";
const app = express();

const PORT = process.env.PORT || 3030;

app.use(cors());

app.get("/", (req, res, next) => {
  return res.redirect("/configure");
});

app.get("/logo.png", (req, res) => {
  return res.sendFile(join(__dirname, "/static/logo.png"));
});

app.get("/configure", function (req, res, next) {
  return res.sendFile(join(__dirname, "/static/index.html"));
});

// Create the catalog
app.get("/:username/manifest.json", async function (req, res, next) {
  const cloned_manifest = JSON.parse(JSON.stringify(manifest)) as Manifest;
  cloned_manifest.id = `${
    !is_prod ? "dev." : ""
  }com.github.megadrive.letterboxd-watchlist-${req.params.username}`;
  cloned_manifest.name = `${!is_prod ? "Dev - " : ""}Letterboxd Watchlist - ${
    req.params.username
  }`;
  cloned_manifest.description = `Provides ${req.params.username}'s watchlist as a catalog.`;
  cloned_manifest.catalogs = [
    {
      id: req.params.username,
      type: "movie",
      name: `${!is_prod ? "dev - " : ""}${
        req.params.username
      } - Letterboxd Watchlist`,
    },
  ];

  return res.json(cloned_manifest);
});

// Serve the meta items
app.get("/:username/catalog/:type/:id?", async (req, res) => {
  // We would use {id} if we had more than one list.
  const { username, type, id } = req.params;

  if (type !== "movie") return res.json({ metas: [] });

  try {
    if (!does_letterboxd_user_exist(decodeURIComponent(username))) {
      throw Error(`[${username}]: doesn't exist`);
    }
    const films = await watchlist_fetcher(decodeURIComponent(username));

    return res.json(films);
  } catch (error) {
    // Return empty
    return res.json({ metas: [] });
  }
});

app.post("/generate/:username", (req, res) => {
  return res.send(
    "https://stremio-letterboxd-watchlist.up.railway.app/" +
      encodeURIComponent(req.params.username) +
      "/manifest.json"
  );
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
