import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

import tunnel from "astro-tunnel";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/": "/configure"
  },
  integrations: [tailwind(), react(), tunnel()]
});