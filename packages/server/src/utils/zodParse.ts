import type { z } from "zod";

/**
 * Parse a JSON object with a Zod schema, logging any errors
 * @param data JSON
 * @param schema Zod schema
 * @returns Parsed data or null if parsing failed
 */
export function zodParse<T>(data: unknown, schema: z.Schema<T>): T | null {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.warn(`Failed to parse Letterboxd list data`);
    console.warn(parsed.error);
    return null;
  }
  return parsed.data;
}
