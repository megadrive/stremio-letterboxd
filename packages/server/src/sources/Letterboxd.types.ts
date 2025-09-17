import { z } from "zod";

export const ContributorTypeSchema = z.enum([
  "Director",
  "CoDirector",
  "Actor",
  "Producer",
  "Writer",
  "OriginalWriter",
  "Story",
  "Casting",
  "Editor",
  "Cinematography",
  "AssistantDirector",
  "AdditionalDirecting",
  "ExecutiveProducer",
  "Lighting",
  "CameraOperator",
  "AdditionalPhotography",
  "ProductionDesign",
  "ArtDirection",
  "SetDecoration",
  "SpecialEffects",
  "VisualEffects",
  "TitleDesign",
  "Stunts",
  "Choreography",
  "Composer",
  "Songs",
  "Sound",
  "Costumes",
  "Creator",
  "MakeUp",
  "Hairstyling",
  "Studio",
]);

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

export const FilmSummarySchema = z.object({
  adult: z.boolean(),
  adultPoster: ImageSchema.optional(),
  alternativeNames: z
    .array(z.string({ description: "First party, Letterboxd internal." }))
    .optional(),
  backdropCustomisable: z.boolean(),
  backdropPickerUrl: z
    .string({ description: "first party, letterboxd internal." })
    .optional(),
  directors: z.array(ContributorSummarySchema).optional(),
  filmCollectionId: z.string().optional(),
  genres: z.array(GenreSchema).optional(),
  id: z.string(),
  link: z.string().url(),
  links: z.array(LinksSchema),
  name: z.string(),
  poster: ImageSchema.optional(),
  posterCustomisable: z.boolean(),
  posterPickerUrl: z
    .string({ description: "first party, letterboxd internal." })
    .optional(),
  originalName: z
    .string({ description: "First party, Letterboxd internal." })
    .optional(),
  rating: z.number().optional(),
  releaseYear: z.number().optional(),
  reviewsHidden: z.boolean(),
  runTime: z.number().optional(),
  sortingName: z.string(),
  top250Position: z.number().nullable().optional(),
});

export const ReleaseSchema = z.object({
  country: z.object({
    code: z.string(),
    name: z.string(),
    flagUrl: z.string().url().optional(),
  }),
  releaseDate: z.string().optional(),
  type: z.enum([
    "Premiere",
    "Theatrical",
    "Theatrical_limited",
    "Digital",
    "Physical",
    "TV",
  ]),
  certification: z.string().optional(),
  language: z
    .object({
      code: z.string(),
      name: z.string(),
    })
    .optional(),
  note: z.string().optional(),
});

// zod merge two schemas
export const FilmSchema = FilmSummarySchema.merge(
  z.object({
    backdrop: ImageSchema.optional(),
    contributions: z
      .array(
        z.object({
          type: ContributorTypeSchema,
          contributors: z.array(ContributorSummarySchema),
        })
      )
      .optional(),
    countries: z.array(
      z.object({
        code: z.string(),
        name: z.string(),
        flagUrl: z.string().url().optional(),
      })
    ),
    description: z.string().optional(),
    primarySpokenLanguage: z
      .object({
        code: z.string(),
        name: z.string(),
      })
      .nullable()
      .optional(),
    releases: z.array(ReleaseSchema).optional(),
    similarTo: z.array(FilmSummarySchema).optional(),
    tagline: z.string().nullable().optional(),
    trailer: z.object({
      url: z.string().url(),
      type: z.string().optional(),
      id: z.string().optional(),
    }),
  })
);

const ListEntrySummarySchema = z.object({
  rank: z.number().optional(),
  film: FilmSummarySchema,
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
      film: FilmSummarySchema,
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

export const ContributorContributionsSchema = z.object({
  next: z.string().optional(),
  items: z.array(
    z.object({
      type: z.string(),
      film: FilmSummarySchema,
      containsSpoilers: z.boolean().optional(),
    })
  ),
  metadata: z.array(
    z.object({
      type: z.string(),
      data: z.object({
        totalFilmCount: z.number(),
        filteredFilmCount: z.number(),
      }),
    })
  ),
});

export const MemberWatchlistSchema = z.object({
  next: z.string().optional(),
  items: z.array(FilmSummarySchema),
});

export const FilmSortSchema = z.enum([
  "ListRanking",
  "FilmPopularity",
  "FilmPopularityThisWeek",
  "FilmPopularityThisMonth",
  "FilmPopularityThisYear",
  "FilmName",
  // "WhenAddedToList",
  // "WhenAddedToListEarliestFirst",
  "Shuffle",
  // "OwnerRatingHighToLow",
  // "OwnerRatingLowToHigh",
  // "OwnerDiaryLatestFirst",
  // "OwnerDiaryEarliestFirst",
  // "AuthenticatedMemberRatingHighToLow",
  // "AuthenticatedMemberRatingLowToHigh",
  // "AuthenticatedMemberDiaryLatestFirst",
  // "AuthenticatedMemberDiaryEarliestFirst",
  // "AuthenticatedMemberBasedOnLiked",
  // "AuthenticatedMemberRelatedToLiked",
  // "MemberRatingHighToLow",
  // "MemberRatingLowToHigh",
  // "MemberDiaryLatestFirst",
  // "MemberDiaryEarliestFirst",
  "AverageRatingHighToLow",
  "AverageRatingLowToHigh",
  // "RatingHighToLow",
  // "RatingLowToHigh",
  "ReleaseDateLatestFirst",
  "ReleaseDateEarliestFirst",
  "FilmDurationShortestFirst",
  "FilmDurationLongestFirst",
]);

export const FilmsSchema = z.object({
  next: z.string().optional(),
  items: z.array(FilmSummarySchema),
});

/**
 * The types returned by doing a HEAD request to Letterboxd.
 *
 * entirely lowercase ones are types we define for our own purposes.
 */
export const LetterboxdTypeSchema = z
  .enum(["List", "Contributor", "Member"])
  .nullable();

export const FilmGenresSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});
