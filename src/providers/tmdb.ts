import { MetaDetail } from "stremio-addon-sdk";
import { env } from "../env.js";
import { z } from "zod";

const TMDBMovieSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  belongs_to_collection: z.string().nullable(),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
  production_companies: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    })
  ),
  production_countries: z.array(
    z.object({ iso_3166_1: z.string(), name: z.string() })
  ),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    })
  ),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

type TMDBMovie = z.infer<typeof TMDBMovieSchema>;

export const tmdb = {
  getMovie: async (id: string) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.ADDON_TMDB_APIKEY}`,
        },
      });

      if (!res.ok) {
        console.error(`Couldn't get TMDB movie: ${id}: ${res.status}`);
        return undefined;
      }

      const json = await res.json();
      const movie = TMDBMovieSchema.parse(json);

      // convert from TMDB to Stremio's Meta
      const meta: MetaDetail = {
        id: "letterboxd-tmdb:" + id,
        type: "movie",
        name: movie.title,
        poster: movie.poster_path,
        background: movie.backdrop_path,
        language: movie.original_language,
        released: movie.release_date,
        description: movie.overview,
        country: movie.origin_country.join(", "),
        genres: movie.genres.map((g) => g.name),
        runtime: `${movie.runtime} min`,
      };

      return meta;
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
