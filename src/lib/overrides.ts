const overrides: { slug: string; imdbId: string }[] = [
  {
    slug: "attack the block 2011",
    imdbId: "tt1478964",
  },
];

export const applyOverride = (slug: string) => {
  const override = overrides.find((override) => {
    return override.slug === slug;
  });
  if (override) {
    return override.imdbId;
  }
  return undefined;
};
