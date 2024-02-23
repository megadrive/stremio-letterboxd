export const generateWatchlistURL = (username: string, page: number = 1) =>
  `https://letterboxd.com/${username}/watchlist/page/${page}`;

export async function doesLetterboxdUserExist(username: string) {
  try {
    const res = await fetch(generateWatchlistURL(username));
    return res.status === 302;
  } catch (error) {
    console.error(`Couldn't determine if ${username} exists.`);
  }

  return false;
}

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
