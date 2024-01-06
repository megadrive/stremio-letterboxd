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
const Watchlist_URL = (username) => `https://letterboxd.com/${username}/watchlist`;
nameToImdb("south park").then((r) => console.log(r));
async function names_to_imdb_id(film_names) {
    return Promise.all(film_names.map((film) => {
        return nameToImdb(film);
    }));
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
    const finished_result = await names_to_imdb_id(films);
    console.log(finished_result);
    return finished_result;
}
exports.watchlist_fetcher = watchlist_fetcher;
//# sourceMappingURL=fetcher.js.map