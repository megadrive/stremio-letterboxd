import { type Config, config } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";

async function seed() {
  // Seed your database here
  console.log("Seeding database");

  const configs: Config[] = [
    {
      url: "https://letterboxd.com/films/popular/this/week/",
      catalogName: "Popular This Week",
      posterChoice: "letterboxd-custom-from-list",
    },
    {
      url: "https://letterboxd.com/films/popular/this/month/",
      catalogName: "Popular This Month",
      posterChoice: "letterboxd-custom-from-list",
    },
  ];

  const encoded: string[] = [];
  for (const conf of configs) {
    const encodedConfig = await config.encode(conf);
    encoded.push(encodedConfig);
  }

  return prisma.config.createMany({
    data: encoded.map((encodedConfig) => {
      return {
        config: encodedConfig,
      };
    }),
  });
}

seed()
  .then(() => {
    console.info("Database seeded");
  })
  .catch((error) => {
    console.error("Failed to seed database", error);
  });
