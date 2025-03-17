/**
 * Converts an extras string to an object. Returns undefined if no extras are found.
 * @param extras `skip=blah&genre=whatever
 */
export const parseExtras = (
  extras?: string
): undefined | Record<string, string> => {
  if (!extras) return undefined;

  const mapped = extras.split("&").map((extra) => {
    const [key, value] = extra.split("=");
    return { key, value };
  });

  const foundExtras: Record<string, string> = {};
  for (const { key, value } of mapped) {
    foundExtras[key] = value;
  }

  return foundExtras;
};
