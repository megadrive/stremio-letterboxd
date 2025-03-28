import { type Config } from "@stremio-addon/config";
import { letterboxdCacher } from "./letterboxdCacher.js";

const l = "https://letterboxd.com";
const configs: Config[] = [
  {
    url: `${l}/films/popular/this/week/`,
    catalogName: "Popular This Week",
    posterChoice: "cinemeta",
    reservedTag: "weekly",
  },
  {
    url: `${l}/films/popular/this/month/`,
    catalogName: "Popular This Month",
    posterChoice: "cinemeta",
    reservedTag: "monthly",
  },
];

for (const config of configs) {
  console.log(`Adding ${config.url} to Letterboxd cacher`);
  letterboxdCacher.addList(config);
}
