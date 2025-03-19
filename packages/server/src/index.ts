import { serve } from "@hono/node-server";
import { serverEnv } from "@stremio-addon/env";
import { addonManifest, createManifest } from "@/util/manifest.js";
import { manifestRouter } from "@/routes/config/manifest.js";
import { catalogRouter } from "@/routes/config/catalog.js";
import { metaRouter } from "@/routes/config/meta.js";
import { streamRouter } from "@/routes/config/stream.js";
import { subtitleRouter } from "@/routes/config/subtitle.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { createAPIRouter, createApp, createRouter } from "@/util/createHono.js";
import { exampleAPIRouter } from "@/routes/api/example.js";

const app = createApp();

app.use(
  "*",
  serveStatic({
    root: "../web/dist/client",
  })
);

if (serverEnv.isProduction) {
  app.get("/", (c) => {
    return c.redirect("/configure");
  });
}

app.get("/manifest.json", (c) => {
  const manifest = createManifest({ ...addonManifest });
  return c.json(manifest);
});

const configRouter = createRouter();
configRouter.route("/manifest.json", manifestRouter);
configRouter.route("/catalog", catalogRouter);
configRouter.route("/meta", metaRouter);
configRouter.route("/stream", streamRouter);
configRouter.route("/subtitle", subtitleRouter);

app.route("/:config", configRouter);

const apiRouter = createAPIRouter();
apiRouter.route("/example", exampleAPIRouter);
app.route("/api", apiRouter);

serve(
  {
    fetch: app.fetch,
    port: serverEnv.PORT,
  },
  (info) => {
    console.log(
      `Server is running on http://localhost:${info.port} in ${serverEnv.NODE_ENV} mode`
    );
  }
);
