import { LetterboxdRegex } from "./consts.js";
import { env } from "./env.js";
import { popularLists } from "./popular.js";

export const generateURL = (id: string, page: number = 1) => {
  if (id.startsWith("_internal_")) {
    const found = popularLists.findIndex((list) => list.id === id);
    if (found >= 0) {
      return popularLists[found].url;
    }
  }

  const separator = "|";
  let part = "";
  const isList = id.indexOf(separator) > 0;
  if (isList) {
    const [username, listid] = id.split(separator);
    part = `${username}/list/${listid}`;
  } else {
    part = `${id}/watchlist`;
  }

  return `https://letterboxd.com/${part}/page/${page}`;
};

export async function doesLetterboxdListExist(id: string) {
  try {
    const generatedURL = generateURL(id);
    const res = await fetch(generatedURL);
    if (res.ok) return true;
  } catch (error) {
    console.warn(`Couldn't determine if ${id} exists.`);
  }

  return false;
}

export const parseLetterboxdURLToID = (url: string) => {
  console.log(`testing ${url}`);
  const match = LetterboxdRegex.exec(url);
  if (!match) return "";
  const username = match[2];
  const listid = match[4];

  return `${username}${listid ? `|${listid}` : ""}`;
};

/**
 * Check if a date is older than the time given.
 * @param datetime Date to check against
 * @param howOld How old in MS to be considered stale.
 */
export const isOld = (datetime: Date, howOld: number): boolean => {
  const rv = Date.now() - datetime.getTime() > howOld;
  // console.log(
  //   `[is_old]: ${Date.now() - datetime.getTime()} > ${howOld} = ${rv}`
  // );
  return rv;
};

/** Format two Date.now()s in 0m 00s format. */
export const formatTimeBetween = (
  from: ReturnType<(typeof Date)["now"]>,
  to = Date.now()
) => {
  const seconds = (to - from) / 1000;
  if (seconds < 60) {
    return `${(to - from) / 1000}s`;
  }
  const minutes = seconds / 60;
  return `${minutes}m ${seconds}s`;
};

export const IDUtil = {
  /** Splits an ID. */
  split: (
    id: string
  ): {
    username: string;
    listId?: string;
    listName: string;
    type: "list" | "watchlist";
  } => {
    const [username, listId] = id.split(
      new RegExp(`[${["|", ","].join("|")}]`)
    );
    // parse the list ID
    const listName = listId ? `${listId.replace(/-/g, " ")}` : "watchlist";
    return { username, listId, listName, type: listId ? "list" : "watchlist" };
  },
};

export const PrependWithDev = (s: string, seperator: string = ".") =>
  !env.isProduction ? `dev${seperator}${s}` : s;
