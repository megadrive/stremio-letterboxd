import { z } from "zod";

export const FullLetterboxdMetadataSchema = z.array(
  z.object({
    lbxd: z.string(),
    slug: z.string(),
    tagline: z.string(),
    synopsis: z.string(),
    genres: z.array(z.string()),
    backdrop: z.string().url().optional(),
    poster: z.string().url(),
    cast: z.array(z.string()),
    crew: z.array(
      z.object({
        role: z.string(),
        people: z.array(z.string()),
      })
    ),
  })
);
