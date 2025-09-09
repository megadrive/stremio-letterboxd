import { to } from "await-to-js";
import type { ISource, SourceOptions, SourceResult } from "./ISource.js";
import { createCache } from "./ISource.js";
import { serverEnv } from "@stremio-addon/env";
import { z } from "zod";

const ListImageSizeSchema = z.object({
  width: z.number().describe("The image width in pixels."),
  height: z.number().describe("The image height in pixels."),
  url: z.string().describe("The URL to the image file."),
});

const ImageSchema = z.object({
  sizes: z
    .array(ListImageSizeSchema)
    .describe("The available sizes for the image."),
});

const PronounSchema = z.object({
  id: z.string().describe("The LID for this pronoun."),
  label: z.string().describe("A label to describe this pronoun."),
  subjectPronoun: z
    .string()
    .describe("The pronoun to use when the member is the subject."),
  objectPronoun: z
    .string()
    .describe("The pronoun to use when the member is the object."),
  possessiveAdjective: z.string(),
  possessivePronoun: z.string(),
  reflexive: z
    .string()
    .describe("The pronoun to use to refer back to the member."),
});

const MemberSchema = z.object({
  id: z.string().describe("The LID of the member."),
  username: z.string(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  displayName: z.string(),
  shortName: z.string(),
  pronoun: PronounSchema.optional(),
  avatar: ImageSchema.optional(),
  memberStatus: z.enum(["Crew", "Alum", "Hq", "Patron", "Pro", "Member"]),
  hideAdsInContent: z.boolean(),
  accountStatus: z.enum(["Active", "Memorialized"]),
  commentPolicy: z.enum(["Anyone", "Friends", "You"]).optional(),
  hideAds: z.boolean(),
});

const FilmSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalName: z.string().optional(),
  sortingName: z.string(),
  alternativeNames: z.array(z.string()).optional(),
  releaseYear: z.number().optional(),
  runTime: z.number().optional(),
  rating: z.number().optional(),
  directors: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      characterName: z.string().optional(),
      tmdbid: z.string().optional(),
      customPoster: ImageSchema.optional(),
    })
  ),
  poster: ImageSchema,
  adultPoster: ImageSchema.optional(),
  top250Position: z.number().optional(),
  adult: z.boolean(),
  reviewsHidden: z.boolean(),
  posterCustomisable: z.boolean(),
  backdropCustomisable: z.boolean(),
  filmCollectionId: z.string().optional(),
  links: z.array(
    z.object({
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
      url: z.string(),
      label: z.string().optional(),
      checkUrl: z.string().optional(),
    })
  ),
  genres: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});

const RelationshipSchema = z.object({
  watched: z.boolean(),
  whenWatched: z.string().optional(),
  liked: z.boolean(),
  whenLiked: z.string().optional(),
  favorited: z.boolean(),
  owned: z.boolean().optional(),
  inWatchlist: z.boolean(),
  whenAddedToWatchlist: z.string().optional(),
  whenCompletedInWatchlist: z.string().optional(),
  rating: z.number().optional(),
  reviews: z.array(z.string()),
  diaryEntries: z.array(z.string()),
  rewatched: z.boolean().optional(),
  privacyPolicy: z.enum(["Anyone", "Friends", "You", "Draft"]),
});

const ListItemSchema = z.object({
  rank: z.number().optional(),
  entryId: z.string(),
  notesLbml: z.string().optional(),
  posterPickerUrl: z.string().optional(),
  backdropPickerUrl: z.string().optional(),
  containsSpoilers: z.boolean().optional(),
  film: FilmSchema,
  whenAdded: z.string(),
  notes: z.string().optional(),
});

const ListMetadataSchema = z.object({
  totalFilmCount: z.number(),
  filteredFilmCount: z.number(),
});

export const ListSchema = z.object({
  next: z.string().optional(),
  items: z.array(ListItemSchema),
  itemCount: z.number().optional(),
  metadata: ListMetadataSchema,
  relationships: z.array(
    z.object({
      member: MemberSchema,
      relationship: z.object({
        counts: z.object({
          watches: z.number(),
          likes: z.number(),
        }),
      }),
    })
  ),
});

const cache = createCache<z.infer<typeof ListSchema>>("letterboxd");

type EndpointType = "list";

const {
  LETTERBOXD_API_BASE_URL,
  LETTERBOXD_API_KEY,
  LETTERBOXD_API_AUTH_TYPE,
} = serverEnv;

export class LetterboxdSource implements ISource {
  async fetch(
    opts: Required<Pick<SourceOptions, "url">>
  ): Promise<SourceResult[]> {
    const { url } = opts;

    if (LETTERBOXD_API_KEY.length === 0) {
      console.warn(`Letterboxd API key not set, moving along...`);
      return [];
    }

    // figure out what endpoint we're after
    const urlObj = new URL(url);

    // list is only supported for now
    let endpoint: EndpointType | null = null;

    if (urlObj.pathname.includes("/list/")) {
      endpoint = "list";
    }

    if (!endpoint) {
      console.warn(`Letterboxd endpoint not supported: ${url}`);
      return [];
    }

    // get the list ID
    const [listIdErr, listIdRes] = await to(
      fetch(`${LETTERBOXD_API_BASE_URL}/list/${url}`, {
        method: "HEAD",
      })
    );

    if (listIdErr || !listIdRes || !listIdRes.ok) {
      console.error(
        `Failed to fetch Letterboxd list ID for ${url}: ${listIdErr}`
      );
      return [];
    }

    const listId = listIdRes.headers.get("x-letterboxd-id");

    if (!listId) {
      console.error(`Failed to get Letterboxd list ID for ${url}`);
      return [];
    }

    const cachedData = await cache.get(listId);
    if (cachedData) {
      return cachedData.items.map((item) => ({
        id: item.film.id,
        name: item.film.name,
        type: "movie",
        poster: item.film.poster.sizes.sort((a, b) => b.width - a.width)[0]
          ?.url,
        releaseInfo: item.film.releaseYear?.toString(),
        tmdbId: item.film.links.find((link) => link.type === "tmdb")?.id,
      }));
    }

    // fetch the data

    return [];
  }
}
