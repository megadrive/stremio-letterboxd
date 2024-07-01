import { fetch } from "cross-fetch";

/**
 * Wrapped version of `cross-fetch` with pre-set headers.
 */
export const addonFetch = (
  url: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1] = {},
): ReturnType<typeof fetch> => {
  const headers: (typeof init)["headers"] = {
    "Content-Type": "application/json",
    "Cache-Control": "private, max-age=3600, must-revalidate",
  };
  return fetch(url, { ...init, headers });
};
