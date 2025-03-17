import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serverEnv } from "@stremio-addon/env";
import { addonManifest, createManifest } from "./util/manifest.js";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { manifestRouter } from "./routes/manifest.js";
import { catalogRouter } from "./routes/catalog.js";
import { metaRouter } from "./routes/meta.js";
import { streamRouter } from "./routes/stream.js";
import { subtitleRouter } from "./routes/subtitle.js";
import { serveStatic } from "hono/serve-static";
import path from "node:path";
import { readFile } from "node:fs/promises";

const app = new Hono();

app.use(cors());
app.use(logger());

app.get("/", (c) => {
  return c.redirect("/configure");
});

app.get("/manifest.json", (c) => {
  const manifest = createManifest({ ...addonManifest });
  return c.json(manifest);
});

const configRoute = new Hono();
configRoute.route("/manifest.json", manifestRouter);
configRoute.route("/catalog", catalogRouter);
configRoute.route("/meta", metaRouter);
configRoute.route("/stream", streamRouter);
configRoute.route("/subtitle", subtitleRouter);

app.route("/:config", configRoute);

app.use(
  "*",
  serveStatic({
    root: "../web/dist/client",
    pathResolve(filePath) {
      return path.resolve(".", filePath);
    },
    getContent(path) {
      return readFile(path);
    },
  })
);

serve(
  {
    fetch: app.fetch,
    port: serverEnv.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
