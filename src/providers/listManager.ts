import { load } from "cheerio";
import { addonFetch } from "../lib/fetch.js";
import { logger } from "../logger.js";

const logBase = logger("listManager");

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
    const log = logBase.extend("fetchListPage");
    log("Fetching list page");
    const res = await addonFetch(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch list page: ${res.statusText}`);
    }
    return res.text();
  }

  private parseListPage($: ReturnType<typeof load>) {
    const log = logBase.extend("parseListPage");
    const $sections = $(".liked-lists section");
    const numSections = $sections.length;
    let numSectionsParsed = 0;
    const lists: List[] = [];
    $sections.each((_, section) => {
      const $section = $(section);
      const person = `${$section.children("strong .name").first().text()} (${$section.data("person")})`;
      const url = $section.children("a").first().attr("href") ?? "";
      const name = $section.children("h2 .title").first().text();
      // const description = $section.children("p").first().text();
      const numFilms = $section.children("span .value").first().text();

      if (!url) return;

      numSectionsParsed++;
      lists.push({
        url,
        name,
        description: `${person}: ${numFilms} films`,
      });
    });
    log(`Found ${numSections} lists, parsed ${numSectionsParsed} lists`);
    return lists;
  }

  /**
   * Poll for new lists
   */
  async poll() {
    const log = logBase.extend("poll");
    log("Polling");

    const numPagesToFetch = 3;

    for (let i = 1; i <= numPagesToFetch; i++) {
      const listUrlPage = `${listUrl}/page/${i}`;
      try {
        log(`Fetching lists from ${listUrlPage}`);

        const html = await this.fetchListPage(listUrlPage);
        const $ = load(html);

        const lists = this.parseListPage($);
        for (const list of lists) {
          log(`Adding list ${list.url}`);
          this.lists.add(list.url);
        }
      } catch (error) {
        log(`Failed to fetch list page: ${error}`);
      }
    }
  }

  startPolling() {
    const log = logBase.extend("poll");
    if (this.intervalId === undefined) {
      log("Starting polling");
      this.intervalId = setInterval(() => this.poll(), this.options.pollRateMS);
      this.poll();
    }
  }

  stopPolling() {
    const log = logBase.extend("poll");
    if (this.intervalId || this.intervalId === 0) {
      log("Stopping polling");
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Recommends a list by getting a random list from the list of lists
   */
  recommend() {
    const log = logBase.extend("recommend");
    log("Getting recommendation");
    const lists = [...this.lists];
    if (lists.length === 0) {
      log("No lists found");
      return undefined;
    }
    return lists[Math.floor(Math.random() * lists.length)];
  }
}
