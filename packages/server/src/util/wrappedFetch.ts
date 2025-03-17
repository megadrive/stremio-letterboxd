export const wrappedFetch = async (url: string, options?: RequestInit) => {
  const defaultHeaders: RequestInit["headers"] = {
    "Cache-Control": "max-age: 3600, stale-while-revalidate",
  };

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...defaultHeaders,
    },
  });
};
