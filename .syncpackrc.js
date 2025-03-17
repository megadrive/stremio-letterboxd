export default {
  versionGroups: [
    {
      packages: ["**"],
      dependencies: ["$LOCAL"],
      dependencyTypes: ["dev", "prod"],
      pinVersion: "workspace:*",
    },
  ],
};
