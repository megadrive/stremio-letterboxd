import { z } from "zod";

/**
 * ? The config schema. Any user-configurable data should be defined here.
 * ? It gets encoded into a string and provided to the addon as a query parameter.
 *
 * If you wanted to add stuff like a debrid apikey, for instance. You would add it here.
 *
 * @configuration
 */
export const ConfigSchema = z.object({
  url: z
    .string()
    .min(1, { message: "A Letterboxd or Boxd.it URL is required." }),
  catalogName: z.string({ description: "The name of the catalog" }),
  posterChoice: z
    .enum([
      "cinemeta",
      "letterboxd",
      "letterboxd-ratings",
      "letterboxd-custom-from-list",
      "rpdb",
    ])
    .default("cinemeta"),
  rpdbApiKey: z.string().optional(),
  reservedTag: z.enum(["weekly", "monthly"]).optional(),
});
export type Config = z.infer<typeof ConfigSchema>;

/** Used in the frontend, we can hide backend-only config values here. */
export const ConfigFormInputSchema = z.object({
  ...ConfigSchema.shape,
  reservedTag: z.undefined(),
});
export type ConfigFormInput = z.infer<typeof ConfigFormInputSchema>;

export const config = {
  /**
   * Decodes the config from a string.
   * @param data Datastring from a URL
   * @returns Config object or undefined if decoding failed
   */
  decode: async (data: string): Promise<Config | undefined> => {
    try {
      const decoded = JSON.parse(atob(data));
      const parsed = ConfigSchema.safeParse(decoded);
      if (!parsed.success) {
        console.error("Failed to parse config", parsed.error.issues);
        return undefined;
      }

      return parsed.data;
    } catch (e: unknown) {
      // @ts-expect-error Message exists on a parsing error.
      console.error("Could not decode config", e?.message);
    }

    return undefined;
  },
  /**
   * Encodes the config into a string.
   * @param data Config object to encode
   * @returns Encoded string
   */
  encode: async (data: Config): Promise<string> => {
    return btoa(JSON.stringify(data));
  },
};
