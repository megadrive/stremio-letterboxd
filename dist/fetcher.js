"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchlist_fetcher = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const name_to_imdb_1 = __importDefault(require("name-to-imdb"));
const util_1 = require("util");
const cheerio_1 = require("cheerio");
const nameToImdb = (0, util_1.promisify)(name_to_imdb_1.default);
const cache = new Map();
const Watchlist_URL = (username) => `https://letterboxd.com/${username}/watchlist`;
async function get_tmdb_info(imdb_id) {
    if (cache.has(imdb_id)) {
        console.log("Serving cache.");
        return cache.get(imdb_id);
    }
    const { movie_results } = await (await (0, cross_fetch_1.default)(`https://api.themoviedb.org/3/find/${imdb_id}?api_key=${process.env.TMDB_API_TOKEN}&external_source=imdb_id`)).json();
    movie_results.fetched = Date.now();
    cache.set(imdb_id, movie_results[0]);
    return movie_results[0];
}
async function get_imdb_id(film_name) {
    const id = await nameToImdb(film_name);
    const data = await get_tmdb_info(id);
    const poster = "https://image.tmdb.org/t/p/w200/" + data.poster_path;
    const name = data.title;
    return {
        id,
        type: "movie",
        name,
        poster,
    };
}
async function get_imdb_ids(film_names) {
    return Promise.all(film_names.map(get_imdb_id));
}
async function watchlist_fetcher(username) {
    const rawHtml = await (await (0, cross_fetch_1.default)(Watchlist_URL(username))).text();
    const $ = (0, cheerio_1.load)(rawHtml);
    const filmSlugs = $(".poster")
        .map(function () {
        return $(this).data().filmSlug;
    })
        .toArray();
    const films = filmSlugs.map((slug) => slug.replace(/-/g, " "));
    const finished_result = await get_imdb_ids(films);
    const meta = { metas: finished_result };
    return meta;
}
exports.watchlist_fetcher = watchlist_fetcher;
//# sourceMappingURL=fetcher.js.map