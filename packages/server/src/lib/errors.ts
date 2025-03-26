type Error = {
  error: string;
  message: string;
};

export const FETCH_FAILED = {
  error: "fetch_failed",
  message: "Failed to fetch the page.",
} satisfies Error;

export const SCRAPE_FAILED = {
  error: "scrape_failed",
  message: "Failed to scrape the page.",
} satisfies Error;
