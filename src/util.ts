export const User_URL = (username: string) =>
  `https://letterboxd.com/${username}/watchlist`;

export const Watchlist_URL = (username: string) =>
  `https://letterboxd.com/${username}/watchlist`;

export async function does_letterboxd_user_exist(username: string) {
  const res = await fetch(User_URL(username));
  return res.status === 302;
}