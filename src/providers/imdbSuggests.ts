import { addonFetch } from "../lib/fetch.js";

const IMDBSEARCH = "https://v2.sg.media-imdb.com/suggestion/h/:query.json";

type IMDBSearchResult = {
  d: {
    /** image */
    i: {
      height: number;
      imageUrl: string;
      width: number;
    };
    id: `tt${number}`;
    /** Name */
    l: string;
    /** type. ex: "feature" */
    q: string;
    /** movie/series */
    qid: string;
    /** imdb rank */
    rank: number;
    /** stars */
    s: string;
    /** year */
    y: number;
  }[];
};

type IMDBResult = {
  name: string;
  year: number;
  imdb_id: string;
  rank: number;
  image: string;
};

/** strip non-alphanumeric characters from a string, includes spaces. */
const onlyAlphaNumeric = (s: string) => s.replace(/[^A-Za-z0-9 ]/gi, "");
export async function find(name: string, year?: number) {
  console.info(`[imdbfind] finding ${name} (${year ?? "no year"})`);
  try {
    const imdbRes = await addonFetch(
      IMDBSEARCH.replace(
        /:query/i,
        encodeURIComponent(`${name} ${year ?? ""}`.trim())
      )
    );
    if (!imdbRes.ok) throw `Couldn't fetch IMDBSearch results.`;

    const searchResults = (await imdbRes.json()) as IMDBSearchResult;
    console.info(
      `[imdbfind] got ${searchResults.d.length} results for ${name}`
    );
    const results = searchResults.d.reduce<IMDBResult[]>((acc, curr) => {
      console.info(
        `        ${onlyAlphaNumeric(
          curr.l.toLowerCase()
        )} !== ${onlyAlphaNumeric(name.toLowerCase())}`
      );
      if (
        onlyAlphaNumeric(curr.l.toLowerCase()) !==
        onlyAlphaNumeric(name.toLowerCase())
      )
        return acc;

      const film: IMDBResult = {
        name,
        year: curr.y,
        imdb_id: curr.id,
        rank: curr.rank,
        image: curr.i.imageUrl,
      };
      acc.push(film);

      return acc;
    }, []);

    return results;
  } catch (error) {
    console.error(error);
  }
  return [];
}
