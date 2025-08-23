import { load } from "cheerio";
import { wrappedFetch } from "./wrappedFetch.js";
import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { to } from "await-to-js";

const listUrl = "https://letterboxd.com/lists/popular/this/week/";

type List = {
  url: string;
  name: string;
  description: string;
};

interface ListManagerOptions {
  pollRateMS: number;
}

const optionsDefaults: ListManagerOptions = {
  pollRateMS: 1000 * 60 * 60,
};

/**
 * Recommends popular lists from letterboxd.com
 */
export class ListManager {
  private lists: Set<string> = new Set();

  options: ListManagerOptions = optionsDefaults;

  private intervalId?: ReturnType<typeof setInterval>;

  get polling() {
    return this.intervalId !== null;
  }

  constructor(options?: Partial<ListManagerOptions>) {
    this.options = { ...optionsDefaults, ...options };
  }

  private async fetchListPage(url: string) {
    const [resErr, res] = await to(
      wrappedFetch(url, {
        headers: {
          "Cache-Control": "no-cache",
        },
      })
    );

    if (resErr) {
      logger.error(`Error fetching list page: ${resErr}`);
      return;
    }

    if (!res.ok) {
      logger.error(`Failed to fetch list page: ${res.statusText}`);
      return;
    }

    return res.text();
  }

  private parseListPage($: ReturnType<typeof load>) {
    const $sections = $(".liked-lists section");
    const lists: List[] = [];
    $sections.each((_, section) => {
      const $section = $(section);
      const person = `${$section.children("strong .name").first().text()} (${$section.data("person")})`;
      const url = $section.children("a").first().attr("href") ?? "";
      const name = $section.children("h2 .title").first().text();
      // const description = $section.children("p").first().text();
      const numFilms = $section.children("span .value").first().text();

      if (!url) return;

      lists.push({
        url,
        name,
        description: `${person}: ${numFilms} films`,
      });
    });
    return lists;
  }

  /**
   * Poll for new lists
   */
  async poll() {
    console.info("ListManager:Polling");

    const numPagesToFetch = 3;

    for (let i = 1; i <= numPagesToFetch; i++) {
      const listUrlPage = `${listUrl}/page/${i}`;

      const [htmlErr, html] = await to(this.fetchListPage(listUrlPage));
      if (htmlErr) {
        console.error(`Error fetching list page ${listUrlPage}: ${htmlErr}`);
        continue;
      }
      if (!html) {
        console.warn(`No HTML returned for list page: ${listUrlPage}`);
        continue;
      }

      const $ = load(html);

      const lists = this.parseListPage($);
      for (const list of lists) {
        this.lists.add(list.url);
      }
    }
  }

  startPolling() {
    if (this.intervalId === undefined) {
      this.intervalId = setInterval(() => this.poll(), this.options.pollRateMS);
      this.poll();
    }
  }

  stopPolling() {
    if (this.intervalId || this.intervalId === 0) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Recommends a list by getting a random list from the list of lists
   */
  recommend() {
    const lists = [...this.lists];
    if (lists.length === 0) {
      return undefined;
    }
    return lists[Math.floor(Math.random() * lists.length)];
  }
}
