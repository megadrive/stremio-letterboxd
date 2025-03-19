// @ts-check
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import { readdirSync } from "fs";
import { join } from "path";

// get a list of all .astro files in pages
// eslint-disable-next-line no-undef
const pagesDir = join(process.cwd(), "src/pages");
const astroFiles = readdirSync(pagesDir).filter((file) =>
  file.endsWith(".astro")
);
const proxyRules = astroFiles.reduce((acc, file) => {
  // @ts-expect-error only way to do this
  acc[`^/${file.replace(/\.astro$/, "")}/.*`] = {
    target: "http://localhost:3000",
  };
  return acc;
}, {});

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/": "/configure",
  },

  adapter: node({
    mode: "standalone",
  }),

  vite: {
    server: {
      cors: true,
      proxy: {
        ...proxyRules,
        "/favicon.ico": {
          target: "http://localhost:3000",
        },
        "/manifest.json": {
          target: "http://localhost:3000",
        },
        "^/.+/manifest.json": {
          target: "http://localhost:3000",
        },
        "^/.+/(catalog|meta|stream|subtitle).*": {
          target: "http://localhost:3000",
        },
        "^/api": {
          target: "http://localhost:3000",
        },
      },
    },
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
