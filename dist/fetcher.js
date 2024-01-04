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
async function watchlist_fetcher(username) {
    const json = await (await (0, cross_fetch_1.default)(`https://media.algobook.info/scrape?url=https://letterboxd.com/${username}/watchlist`)).json();
    const html = json.data;
    console.log(`got html: ${html.length}`);
    const $ = (0, cheerio_1.load)(html);
    const movies = $(".poster-list poster");
    console.log(movies.data("film-name"));
    return [];
}
exports.watchlist_fetcher = watchlist_fetcher;
//# sourceMappingURL=fetcher.js.map