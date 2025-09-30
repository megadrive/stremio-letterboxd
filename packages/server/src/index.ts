import { serve } from "@hono/node-server";
import { serverEnv } from "@stremio-addon/env";
import { addonManifest, createManifest } from "@/util/manifest.js";
import { manifestRouter } from "@/routes/config/manifest.js";
import { catalogRouter } from "@/routes/config/catalog.js";
import { metaRouter } from "@/routes/config/meta.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { createAPIRouter, createApp, createRouter } from "@/util/createHono.js";
import { recommendAPIRouter } from "@/routes/api/recommend.js";
import { statsAPIRouter } from "@/routes/api/stats.js";
import { resolveAPIRouter } from "@/routes/api/resolve.js";
import { posterAPIRouter } from "@/routes/api/poster.js";
import { configAPIRoute } from "@/routes/api/config.js";

const app = createApp();

app.use(
  "*",
  serveStatic({
    root: "../web/dist/client",
  })
);

app.get("/", (c) => {
  return c.redirect("/configure");
});

app.get("/manifest.json", (c) => {
  const manifest = createManifest({ ...addonManifest });
  return c.json(manifest);
});

const configRouter = createRouter();
configRouter.route("/manifest.json", manifestRouter);
configRouter.route("/catalog", catalogRouter);
configRouter.route("/meta", metaRouter);
configRouter.get("/configure", (c) => {
  // NOTE: Stremio doesn't support changing the config for a lot of what we do, so just ignore it.
  return c.redirect(`/configure`);
});
app.route("/:config", configRouter);

const apiRouter = createAPIRouter();
apiRouter.route("/config", configAPIRoute);
apiRouter.route("/poster", posterAPIRouter);
apiRouter.route("/recommend", recommendAPIRouter);
apiRouter.route("/resolve", resolveAPIRouter);
apiRouter.route("/stats", statsAPIRouter);
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
