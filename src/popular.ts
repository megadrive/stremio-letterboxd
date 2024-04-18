import { fetchWatchlistPage } from "./fetcher.js";

export const popularLists: {
  id: string;
  name: string;
  url: `https://${string}`;
}[] = [
  {
    id: "_internal_|weekly",
    name: "Popular This Week",
    url: "https://letterboxd.com/films/ajax/popular/this/week/",
  },
  {
    id: "_internal_|monthly",
    name: "Popular This Month",
    url: "https://letterboxd.com/films/ajax/popular/this/month/",
  },
];

const startFetchingPopular = () => {
  const promises = popularLists.map((list) => fetchWatchlistPage(list.id));

  Promise.all(promises)
    .then(() => console.info("Fetched weekly and monthly popular lists."))
    .catch((err) => {
      console.warn(`Couldn't fetch popular lists.`);
      console.warn(err);
    });
};
