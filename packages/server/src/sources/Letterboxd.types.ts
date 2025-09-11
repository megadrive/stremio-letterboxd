import { z } from "zod";

const TagSchema = z.object({
  tag: z.string({ description: "deprecated, use displayTag instead" }),
  code: z.string(),
  displayTag: z.string(),
});

const PronounSchema = z.object({
  id: z.string(),
  label: z.string(),
  subjectPronoun: z.string(),
  objectPronoun: z.string(),
  possessiveAdjective: z.string(),
  possessivePronoun: z.string(),
  reflexive: z.string(),
});

const MemberSummarySchema = z.object({
  id: z.string(),
  username: z.string(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  displayName: z.string(),
  shortName: z.string(),
  pronoun: PronounSchema,
  avatar: z.object({
    sizes: z.array(
      z.object({
        width: z.number(),
        height: z.number(),
        url: z.string().url(),
      })
    ),
  }),
  memberStatus: z.enum(["Crew", "Alum", "Hq", "Patron", "Pro", "Member"]),
  hideAdsInContent: z.boolean(),
  accountStatus: z.enum(["Active", "Memorialized"]),
  hideAds: z.boolean({ description: "deprecated" }),
});

const ImageSchema = z.object({
  sizes: z.array(
    z.object({
      width: z.number(),
      height: z.number(),
      url: z.string().url(),
    })
  ),
});

const ContributorSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  characterName: z.string().optional(),
  tmdbId: z.number().optional(),
  customPoster: ImageSchema.optional(),
});

const LinksSchema = z.object({
  type: z.enum([
    "letterboxd",
    "boxd",
    "tmdb",
    "imdb",
    "justwatch",
    "facebook",
    "instagram",
    "twitter",
    "youtube",
    "tickets",
    "tiktok",
    "bluesky",
    "threads",
  ]),
  id: z.string(),
  url: z.string().url(),
  label: z.string().optional(),
  checkUrl: z.string().url().optional(),
});

const GenreSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const FilmSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalName: z
    .string({ description: "First party, Letterboxd internal." })
    .optional(),
  link: z.string().url(),
  sortingName: z.string(),
  alternativeNames: z
    .array(z.string({ description: "First party, Letterboxd internal." }))
    .optional(),
  releaseYear: z.number().optional(),
  runTime: z.number().optional(),
  rating: z.number().optional(),
  directors: z.array(ContributorSummarySchema),
  poster: ImageSchema.optional(),
  adultPoster: ImageSchema.optional(),
  top250Position: z.number().nullable().optional(),
  adult: z.boolean(),
  reviewsHidden: z.boolean(),
  posterCustomisable: z.boolean(),
  backdropCustomisable: z.boolean(),
  filmCollectionId: z.string().optional(),
  links: z.array(LinksSchema),
  genres: z.array(GenreSchema),
  posterPickerUrl: z
    .string({ description: "first party, letterboxd internal." })
    .optional(),
  backdropPickerUrl: z
    .string({ description: "first party, letterboxd internal." })
    .optional(),
});

const ListEntrySummarySchema = z.object({
  rank: z.number().optional(),
  film: FilmSchema,
});

export const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.number().optional(),
  filmCount: z.number(),
  published: z.boolean(),
  ranked: z.boolean(),
  hasEntriesWithNotes: z.boolean(),
  tags: z.array(z.string()),
  tags2: z.array(TagSchema),
  whenCreated: z.coerce.date(),
  whenPublished: z.coerce.date().nullable(),
  whenUpdated: z.coerce.date(),
  sharePolicy: z.enum(["Anyone", "Friends", "You"]),
  owner: MemberSummarySchema,
  clonedFrom: z.string().optional(),
  previewEntries: z.array(ListEntrySummarySchema),
  links: z.array(LinksSchema),
});

export const ListEntriesSchema = z.object({
  next: z.string().optional(),
  items: z.array(
    z.object({
      entryId: z.string(),
      film: FilmSchema,
      whenAdded: z.coerce.date(),
      containsSpoilers: z.boolean().optional(),
      notes: z.string().optional(),
      rank: z.number().optional(),
    })
  ),
  metadata: z.object({
    filteredFilmCount: z.number(),
    totalFilmCount: z.number(),
  }),
  itemCount: z.number().optional(),
});
