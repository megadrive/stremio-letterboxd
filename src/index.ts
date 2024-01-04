import manifest from "./manifest";
import fetch from "cross-fetch";
import { parseStringPromise as parseString } from "xml2js";
import cors from "cors";
import express from "express";
import { watchlist_fetcher } from "./fetcher";
const app = express();

const PORT = 3030;

app.use(cors());

app.get("/manifest.json", function (req, res, next) {
  return res.json(manifest);
});

app.get("/:username/manifest.json", async function (req, res, next) {
  try {
    await watchlist_fetcher(req.params.username);
    return res.json({ ok: true });
  } catch (e) {
    return res.json({ error: e });
  }
});

app.listen(PORT, () =>
  console.log(`Addon URL: http://localhost:${PORT}/manifest.json`)
);
