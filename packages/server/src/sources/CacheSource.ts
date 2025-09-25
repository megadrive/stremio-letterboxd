import { prisma } from "@stremio-addon/database";
import type { FetchReturn, ISource, SourceResult } from "./ISource.js";
import {
  CatalogMetadataSchema,
  letterboxdCacher,
} from "@/workers/letterboxdCacher.js";
import type { Config } from "@stremio-addon/config";

export class CacheSource implements ISource {
  async fetch(opts: { config: Config; configString: string }): FetchReturn {
    const { config, configString } = opts;

    const encodedConfig = configString;
    const cached = await prisma.config.findFirst({
      where: {
        config: encodedConfig,
      },
    });

    if (!cached) {
      console.error(`Failed to find cached metadata for ${encodedConfig}`);

      return { shouldStop: false, metas: [] };
    }

    // if the cache is older than 24 hours, update it in the background
    const TTL = 1000 * 60 * 60; // 1 hour
    if (cached && Date.now() - cached.updatedAt.getTime() > TTL) {
      // kick off an update if the config is not up to date
      letterboxdCacher.addList(config);
    }

    const cachedMetadata = CatalogMetadataSchema.safeParse(
      JSON.parse(cached.metadata)
    );

    if (cachedMetadata.success === false) {
      console.error(`Failed to parse cached metadata for ${encodedConfig}`);

      return { shouldStop: false, metas: [] };
    }

    const slugs = cachedMetadata.data.items.map((item) => item.id);
    const cachedFilms = await prisma.film.findMany({
      where: {
        id: {
          in: slugs,
        },
      },
    });

    const filmsData: SourceResult[] = cachedFilms.map((film) => ({
      id: film.id,
      name: film.title,
      description: film.description || undefined,
      cast: film.cast ? JSON.parse(film.cast) : undefined,
      director: film.director ? JSON.parse(film.director) : undefined,
      genres: film.genres ? JSON.parse(film.genres) : undefined,
      imdb: film.imdb ?? undefined,
      tmdb: film.tmdb,
    }));

    console.info(`Sorting films for ${config.url}`);
    // order the films in the same order as the slugs
    filmsData.sort((a, b) => {
      return slugs.indexOf(a.id) - slugs.indexOf(b.id);
    });

    return {
      shouldStop: false,
      metas: filmsData,
    };
  }
}
