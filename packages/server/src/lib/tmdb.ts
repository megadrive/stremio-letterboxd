import { serverEnv } from "@stremio-addon/env";
import { z, type ZodSchema } from "zod";
import { pinoLoggerStandalone as logger } from "./pinoLogger.js";
import { to } from "await-to-js";

type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

async function tmdbApi<T>(
  endpoint: `/${string}`,
  tmdbApiKey: string,
  schema: ZodSchema
): Promise<Result<T>> {
  const [resErr, res] = await to(
    fetch(`https://api.themoviedb.org/3${endpoint}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${tmdbApiKey}`,
      },
    })
  );

  if (resErr) {
    logger.error(`Error fetching TMDB API: ${resErr}`);
    return Promise.resolve({
      success: false,
      error: `Error fetching TMDB API: ${resErr}`,
    });
  }

  if (!res.ok) {
    return Promise.resolve({
      success: false,
      error: `Error fetching TMDB API: ${res.status} ${res.statusText}`,
    });
  }

  const [jsonErr, json] = await to(res.json());
  if (jsonErr) {
    logger.error(`Error parsing TMDB API response: ${jsonErr}`);
    return Promise.resolve({
      success: false,
      error: `Error parsing TMDB API response: ${jsonErr}`,
    });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    logger.error("Error parsing TMDB API response");
    logger.error(parsed.error.issues);
    return Promise.resolve({
      success: false,
      error: `Error parsing TMDB API response: ${parsed.error}`,
    });
  }

  return Promise.resolve({
    success: true,
    data: parsed.data,
  });
}

const TMDBMovieDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable(),
      backdrop_path: z.string().nullable(),
    })
    .nullable(),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(z.unknown()),
  production_countries: z.array(z.unknown()),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(z.unknown()),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const tmdb = (tmdbApikey = serverEnv.TMDB_APIKEY) => {
  return {
    getMovieDetails: async (id: number) => {
      const apiCall = await tmdbApi<z.infer<typeof TMDBMovieDetailsSchema>>(
        `/movie/${id}`,
        tmdbApikey,
        TMDBMovieDetailsSchema
      );

      if (!apiCall.success) {
        throw new Error(apiCall.error);
      }

      return apiCall.data;
    },
  };
};
