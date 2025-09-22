import { z } from "zod";

const TypeSchema = z.enum(["movie", "show"]);

const ItemSchema = z.object({
  type: TypeSchema,
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  year: z.number().optional(),
  is_adult: z.boolean().optional(),
  runtime: z.number().optional(),
  rating: z.number().optional(),
  poster: z.string().url().optional(),
  updated_at: z.coerce.date(),
  index: z.number().optional(),
  genre_ids: z.array(z.string()).optional(),
  id_map: z.object({
    type: TypeSchema,
    imdb: z.string().optional(),
    tmdb: z.string().optional(),
    tvdb: z.string().optional(),
    trakt: z.string().optional(),
    lboxd: z.string().optional(),
  }),
});

const ListSchema = z.object({
  provider: z.literal("letterboxd"),
  id: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  user_id: z.string().optional(),
  user_slug: z.string().optional(),
  title: z.string(),
  description: z.string().nullable(),
  item_type: TypeSchema,
  is_private: z.boolean(),
  is_personal: z.boolean(),
  item_count: z.number(),
  updated_at: z.coerce.date(),
  items: z.array(ItemSchema),
});

export const StremthruResponseSchema = z.object({
  data: ListSchema,
});
