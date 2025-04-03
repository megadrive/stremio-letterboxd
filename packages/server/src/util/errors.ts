import type { MetaDetail } from "stremio-addon-sdk";
import type { Config } from "@stremio-addon/config";
import { z } from "zod";

const ErrorIDSchema = z.enum(["invalid-config"]);
type ErrorID = z.infer<typeof ErrorIDSchema>;
export const errors: Record<ErrorID, MetaDetail> = {
  "invalid-config": {
    id: "letterboxd:error:invalid-config",
    // @ts-expect-error custom type
    type: "letterboxd",
    name: "❌ Invalid config ❌",
    description:
      "Your configuration is invalid. You will need to reconfigure your addon.",
    videos: [
      {
        id: "error:invalid-config",
        // @ts-expect-error "title" breaks it.
        name: "Reconfigure your addon by clicking here.",
        streams: [
          {
            title: "Reconfigure your addon by clicking here.",
            externalUrl: `{{origin}}/configure`,
            behaviorHints: {
              notWebReady: true,
            },
          },
        ],
      },
    ],
  },
};

export const getError = (
  errorCode: string,
  config: Config
): MetaDetail | undefined => {
  const parsedErrorCode = ErrorIDSchema.parse(errorCode);
  const errorMeta = errors[parsedErrorCode];

  if (!errorMeta) {
    return undefined;
  }

  return {
    ...errorMeta,
    videos: errorMeta.videos?.map((video) => ({
      ...video,
      streams: video.streams?.map((stream) => ({
        ...stream,
        externalUrl: stream.externalUrl?.replace("{{origin}}", config.origin),
      })),
    })),
  };
};
