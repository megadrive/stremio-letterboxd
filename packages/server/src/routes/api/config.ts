import { pinoLoggerStandalone as logger } from "@/lib/pinoLogger.js";
import { createAPIRouter } from "@/util/createHono.js";
import { letterboxdCacher } from "@/workers/letterboxdCacher.js";
import { config, ConfigSchema } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";
import { NOT_FOUND } from "stoker/http-status-codes";

/** Fetch a Letterboxd poster on demand and cache. */
export const configAPIRoute = createAPIRouter();

configAPIRoute.get("/:encodedConfigOrId", async (c) => {
  const encodedConfigOrId = c.req.param("encodedConfigOrId");
  try {
    const configRecord = await prisma.config.findFirst({
      where: {
        OR: [
          {
            id: encodedConfigOrId,
          },
          {
            config: encodedConfigOrId,
          },
        ],
      },
    });
    if (!configRecord) {
      logger.error("Failed to fetch config", encodedConfigOrId);
      return c.json({ success: false, message: "Config not found" }, NOT_FOUND);
    }

    const parsedConfig = await config.decode(configRecord.config);
    if (!parsedConfig) {
      logger.error("Failed to decode config", configRecord.config);
      return c.json(
        { success: false, message: "Failed to decode config" },
        NOT_FOUND
      );
    }

    return c.json({ success: true, config: parsedConfig });
  } catch (error) {
    logger.error("Failed to fetch config", error);
    return c.json(
      { success: false, message: "Failed to fetch config" },
      NOT_FOUND
    );
  }
});

configAPIRoute.put("/:id", async (c) => {
  const id = c.req.param("id");

  if (!id) {
    logger.error("No config id provided");
    return c.json({ success: false });
  }
  try {
    const body = await c.req.json();

    // ensure config is legit
    const parsed = ConfigSchema.safeParse(body);

    if (!parsed.success) {
      logger.error("Failed to parse config", parsed.error);
      return c.json({ success: false, message: "Invalid config" }, NOT_FOUND);
    }

    const configRecord = await prisma.config.findFirst({
      where: {
        OR: [
          {
            id: id,
          },
        ],
      },
    });

    if (!configRecord) {
      logger.error("Failed to fetch config", id);
      return c.json({ success: false, message: "Config not found" }, NOT_FOUND);
    }

    await prisma.config.update({
      where: {
        id: configRecord.id,
      },
      data: {
        config: JSON.stringify(parsed.data),
      },
    });
  } catch (error) {
    logger.error("Failed to update config", error);
    return c.json({ success: false, message: "Failed to update config" });
  }

  return c.json({ success: true });
});

configAPIRoute.post("/:encodedConfigOrId", async (c) => {
  const encodedConfig = c.req.param("encodedConfigOrId");
  if (!encodedConfig) {
    logger.error("No encoded config provided");
    return c.json({ success: false });
  }

  try {
    const conf = await config.decode(encodedConfig);
    if (!conf) {
      logger.error("Failed to decode config", encodedConfig);
      return c.json({ success: false });
    }

    c.var.logger.info("Creating config flow");
    c.var.logger.info({
      encodedConfig,
      conf,
    });

    try {
      // try to fetch the config, if it exists
      c.var.logger.info("Attempting to fetch config");
      const record = await prisma.config.findFirst({
        where: {
          config: encodedConfig,
        },
      });
      if (record) {
        c.var.logger.info("Found existing config", { recordId: record.id });
        return c.json({ success: true, id: record.id });
      }
    } catch (error) {
      c.var.logger.warn("Failed to fetch config", error);
    }

    // create an initial empty record to reserve the config
    const newRecord = await prisma.config.create({
      data: {
        config: encodedConfig,
        metadata: JSON.stringify([]),
      },
    });

    // fetch metadata for the list and update in the background
    letterboxdCacher
      .scrapeList(conf)
      .then(async (metadata) => {
        try {
          // try to create the config
          c.var.logger.info("Attempting to create config");
          const record = await prisma.config.update({
            where: { id: newRecord.id },
            data: {
              config: encodedConfig,
              metadata: JSON.stringify(metadata),
            },
          });
          c.var.logger.info("Create config", {
            newRecordId: record.id,
            encodedConfig,
            metadata: `${metadata?.length ? metadata.length : 0} items`,
          });
        } catch (error) {
          c.var.logger.error("Failed to create config", error);
        }
      })
      .catch((error) => {
        c.var.logger.error("Failed to scrape list", error);
      });

    const { id } = newRecord;

    return c.json({ success: true, id });
  } catch (error) {
    logger.error("Failed to create config");
    logger.error(error);
  }

  return c.json({ success: false });
});
