/*
import UserAgent from "user-agents";
import { prisma } from "./prisma.js";
import { load as cheerio } from "cheerio";
import { type Movie } from "@prisma/client";
import { promisify } from "util";
import NameToIMDBID from "name-to-imdb";
const nameToImdb = promisify(NameToIMDBID);

const userAgent = new UserAgent();
const queue = new (await import("p-queue")).default({
  concurrency: 5,
  autoStart: true,
});

type WorkItem = {
  type: "watchlist" | "list";
  // username or username/list *
  slug: string;
};

type WorkerOptions = {
  agent: "random" | string;
};

type FetchOptions = {
  filmsPerPage: number;
};

class Worker {
  options: WorkerOptions = {
    agent: "random",
  };
  items = new Map<WorkItem["slug"], WorkItem>();

  constructor(options?: WorkerOptions) {
    this.options = Object.assign(this.options, options);

    this.queueListsFromDatabase(true);
  }

  async queueListsFromDatabase(init = false) {
    if (init) {
      // grab the current usernames from the db
      const watchlists = await prisma.letterboxdUser.findMany();

      watchlists.forEach((watchlist) => {
        let url = watchlist.id;
        if (!url.startsWith("https://")) {
          // cater for current data
          url = `https://letterboxd.com/user/${url}/watchlist`;
        }

        this.items.set(url, {
          slug: watchlist.id,
          type: "watchlist",
        });
      });
    }

    // add to queue
    queue.addAll(
      [...this.items].map(
        ([, item]) =>
          () =>
            this.fetch(item)
      )
    );
  }

  private parseUrl(url: string): WorkItem | null {
    // https://letterboxd.com/fcbarcelona/list/movies-everyone-should-watch-at-least-once/
    // https://letterboxd.com/fcbarcelona/watchlist
    const rurl =
      /https?:\/\/(www\.)?letterboxd\.com\/(\w+)\/(watchlist|list)\/?([A-Za-z0-9\-_]+)?\/?/i;

    const match = rurl.exec(url);
    if (!match) return null;

    const [, , username, type, list_id] = match;
    let slug = `${username}/${type}`;
    if (type.toLowerCase() === "list") {
      slug = `${username}/${type}/${list_id}`;
    }

    return {
      slug,
      type: type === "watchlist" ? "watchlist" : "list",
    };
  }

  //* Add a URL to begin tracking. *
  add(
    url: string,
    options: Parameters<(typeof queue)["add"]>[1] = { priority: 1000 }
  ) {
    const item = this.parseUrl(url);
    console.log({ url, item });
    if (!item) throw Error("Wrong URL format");

    queue.add(() => this.fetch(item), options);
  }

  private async fetch(item: WorkItem) {
    const agent =
      this.options.agent === "random" ? new UserAgent() : this.options.agent;

    console.log(`Fetching ${item.slug} as ${agent.toString()}`);

    switch (item.type) {
      case "list":
        this.fetchList(item);
        break;
      case "watchlist":
        this.fetchWatchlist(item);
        break;
    }
  }

  private async getPageHtml(item: WorkItem, page = 1) {
    // if only username available, prefer watchlist.
    if (!item.slug.includes("watchlist") && !item.slug.includes("list")) {
      item.slug = `${item.slug}/watchlist`;
    }

    const url = `https://letterboxd.com/${item.slug}/page/${page}`;
    const res = await fetch(url);
    if (!res.ok) throw Error(`Couldn't fetch ${item.slug}: ${url}`);
    const html = await res.text();
    return html;
  }

  private async getCinemeta(imdbId: `tt${string}`) {
    try {
      const res = await fetch(
        `https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`
      );
      if (!res.ok) throw Error("Bad response.");

      const json = await res.json();
      return json;
    } catch (err) {
      console.error(`Couldn't get Cinemeta data for ${imdbId}`);
      console.error(err);
    }
  }

  // ensure it's in the same order as is on letterboxd
  private sortMovies(letterboxdSlug: string[], databaseMovies: Movie[]) {
    const rv: string[] = [];

    for (const slug of letterboxdSlug) {
      const found = databaseMovies.findIndex(
        (movie) => movie.letterboxd_slug === slug
      );

      if (found === -1) continue;

      rv.push(databaseMovies[found].imdb_id);
    }

    return rv;
  }

  //** Get film data, this does some calls to external APIs, so can take a while
  private async getFilms(
    $: ReturnType<typeof cheerio>,
    selector: string = ".poster"
  ): Promise<string[]> {
    const $posters = $(selector.trim());

    if ($posters.length === 0) {
      return [];
    }

    const slugs: undefined | string[] = [];
    $posters.each(function () {
      const slug = $(this).data("filmSlug");
      if (!slug) {
        return false;
      }
      if (typeof slug !== "string") {
        return false;
      }

      slugs.push(slug);
      return true;
    });

    console.log(`Got ${slugs.length} slugs`);

    // Attempt to get IMDB ID.
    const filmData: Omit<Movie, "id" | "created_at" | "updated_at">[] = [];
    for (const slug of slugs) {
      const url = `https://letterboxd.com/ajax/poster/film/${slug}/std/125x187/`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Couldn't fetch ${slug} from Letterboxd`);
        continue;
      }

      const rawHtml = await res.text();
      const $$ = cheerio(rawHtml);

      const $div = $$("div").first();
      const data = $div.data();
      const query = `${decodeURIComponent($div.text())} ${
        data.filmReleaseYear
      }`.replace(/ +/g, " ");
      console.log(`converting to imdb id ${query}`);
      const imdb_id = await nameToImdb(query);
      console.log(`got ${imdb_id}`);

      // Get Cinemeta data about the title
      const cinemeta = await this.getCinemeta(imdb_id);

      filmData.push({
        imdb_id,
        description: cinemeta.description,
        letterboxd_slug: slug,
        name: cinemeta.name,
        poster: cinemeta.poster,
      });
    }

    // cache to database
    const cached_movies = await Promise.allSettled(
      filmData.map((film) => {
        return prisma.movie.upsert({
          where: {
            letterboxd_slug: film.letterboxd_slug,
          },
          create: {
            ...film,
          },
          update: {
            ...film,
          },
        });
      })
    );

    console.log(
      cached_movies.filter((cached) => cached.status === "fulfilled").length +
        " movies updated or created"
    );

    // Get film data for this particular user
    const userMovies = await prisma.movie.findMany({
      where: {
        id: {
          in: slugs,
        },
      },
    });

    const sortedMovies = this.sortMovies(slugs, userMovies);

    return sortedMovies;
  }

  // 100 per page
  private async fetchList(
    item: WorkItem,
    options: FetchOptions = {
      filmsPerPage: 100,
    }
  ) {}

  // 28 per page
  private async fetchWatchlist(
    item: WorkItem,
    options: FetchOptions = {
      filmsPerPage: 28,
    }
  ) {
    try {
      const pageHtml = await this.getPageHtml(item);
      const $ = cheerio(pageHtml);

      const films = await this.getFilms($);
    } catch (error) {
      console.error(`Couldn't get watchlist ${item.slug}`);
      console.error(error);
    }
  }
}

export const worker = new Worker();
*/
