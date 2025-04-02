import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { createAPIRouter } from "@/util/createHono.js";
import { letterboxdCacher } from "@/workers/letterboxdCacher.js";
import { config } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";

/** Fetch a Letterboxd poster on demand and cache. */
export const createConfigAPIRoute = createAPIRouter();

createConfigAPIRoute.post("/:encodedConfig", async (c) => {
  const encodedConfig = c.req.param("encodedConfig");

  try {
    const conf = await config.decode(encodedConfig);
    if (!conf) {
      logger.error("Failed to decode config", encodedConfig);
      return c.json({ success: false });
    }

    const metadata = await letterboxdCacher.scrapeList(conf);

    c.var.logger.info("Creating config", { encodedConfig, metadata });
    let record;

    try {
      // try to fetch the config, if it exists
      record = await prisma.config.findFirst({
        where: {
          config: encodedConfig,
        },
      });
    } catch (error) {
      c.var.logger.warn("Failed to fetch config", error);
    }

    if (!record) {
      try {
        // try to create the config
        record = await prisma.config.create({
          data: {
            config: encodedConfig,
            metadata: JSON.stringify(metadata),
          },
        });
        c.var.logger.info("Create config", {
          newRecordId: record.id,
          encodedConfig,
          metadata,
        });
      } catch (error) {
        c.var.logger.error("Failed to create config", error);
      }
    }

    // if it STILL doesn't exist, we've failed
    if (!record) {
      return c.json({ success: false });
    }

    const { id } = record;

    return c.json({ success: true, id });
  } catch (error) {
    logger.error("Failed to create config");
    logger.error(error);
  }

  return c.json({ success: false });
});
