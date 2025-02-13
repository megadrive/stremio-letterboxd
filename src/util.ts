import { LetterboxdRegex } from "./consts.js";
import { env } from "./env.js";

/**
 * Generates a Letterboxd URL from a path.
 * @param path Path to a Letterboxd resource
 * @param page The page number, defaults to 1
 * @param isAjaxRequest If it's an AJAX request, changes the URL slightly
 * @returns A fully-qualified Letterboxd URL
 */
export const generateURL = (path: string, page = 1, isAjaxRequest = false) => {
  // slice is to strip the initial /
  let split = path.replace(/\/+/g, "/").split("/");
  if (isAjaxRequest) {
    split = [split[1], "ajax", ...split.slice(2)];
  }
  return `https://letterboxd.com/${split.join("/")}/page/${page}`;
};

export async function doesLetterboxdResourceExist(
  path: string,
  isFullUrl = false
) {
  try {
    const generatedURL = isFullUrl ? path : generateURL(path);
    const res = await fetch(generatedURL);
    if (res.ok) return true;
    throw new Error(res.statusText);
  } catch (error) {
    console.warn(`Couldn't determine if ${path} exists: ${error.message}`);
  }

  return false;
}

/**
 * @todo change this to parse to a `Config` object.
 * @deprecated
 * */
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
    const [username, unparsedListId] = id.split("|");
    const [listId] = unparsedListId?.split(",") ?? "";
    console.log({ unparsedListId, listId });
    // parse the list ID
    const listName = listId ? `${listId.replace(/-/g, " ")}` : "watchlist";
    return { username, listId, listName, type: listId ? "list" : "watchlist" };
  },
};

export const PrependWithDev = (s: string, seperator = ".") =>
  !env.isProduction ? `dev${seperator}${s}` : s;

/**
 * Converts HTML entities to their actual characters from a string.
 * For example: &amp; becomes &, &quot; becomes ", etc.
 */
export const convertHTMLEntities = (str: string) =>
  str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

/**
 * Converts an extras string to an object.
 * @param extras Extras string from the catalog request.
 * @returns The parsed extras object or undefined if no extras were provided.
 */
export const parseExtrasFromCatalogRequest = (extras?: string) => {
  if (!extras) return undefined;

  const rextras = /([A-Za-z]+)+=([A-Za-z0-9]+)/g;
  const matched = [...extras.matchAll(rextras)];
  const rv: Record<string, string> = {};
  for (const match of matched) {
    rv[match[1]] = match[2] ?? true;
  }
  return rv;
};

export const paginateArray = (arr: unknown[], skip = 100): unknown[] => {
  const amt = arr.length;
  let skipAmt = 0;

  if (!skip) {
    skipAmt = amt;
  }

  const sliced = arr.slice(skipAmt, amt);
  return sliced;
};
