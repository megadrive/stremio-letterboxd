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
  variable1: z.string().min(1, { message: "Variable 1 is required" }),
});
export type Config = z.infer<typeof ConfigSchema>;

export const config = {
  /**
   * Decodes the config from a string.
   * @param data Datastring from a URL
   * @returns Config object or undefined if decoding failed
   */
  decode: async (data: string): Promise<Config | undefined> => {
    try {
      const decoded = JSON.parse(atob(data));
      const parsed = ConfigSchema.parse(decoded);

      return parsed;
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
