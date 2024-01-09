import { Manifest } from "stremio-addon-sdk";

const manifest: Manifest = {
  id: "github.megadrive.stremio.letterboxd",
  version: "0.0.1",
  name: "",
  logo: "https://stremio-letterboxd-watchlist.up.railway.app/logo.png",
  description: "Addon to add Letterboxd lists as catalogs",
  types: ["movie"],
  resources: ["catalog"],
  catalogs: [],
};

export default manifest;
