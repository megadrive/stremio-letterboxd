import {
  letterboxdCacher,
  type CatalogMetadata,
} from "@/workers/letterboxdCacher.js";
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

  for (const conf of configs) {
    const encoded = await config.encode(conf);
    const items = await letterboxdCacher.scrapeList(conf);

    if (!items) {
      console.error("Failed to scrape metadata for", conf.url);
      continue;
    }

    const metadata: CatalogMetadata = {
      name: conf.catalogName,
      items: items,
    };

    console.info("Seeding database with", conf);
    await prisma.config.create({
      data: {
        config: encoded,
        metadata: JSON.stringify(metadata),
        isReserved: true,
      },
    });
  }
}

seed()
  .then(() => {
    console.info("Database seeded");
  })
  .catch((error) => {
    console.error("Failed to seed database", error);
  });
