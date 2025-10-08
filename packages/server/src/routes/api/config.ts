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
  const encodedConfigString = c.req.param("encodedConfigOrId");
  const encodedConfigs = encodedConfigString.split("|");

  if (!encodedConfigString || encodedConfigs.length === 0) {
    logger.error("No encoded configs provided");
    return c.json({ success: false });
  }

  let providedConfigs: Awaited<ReturnType<typeof config.decode>>[] = [];
  for (const encodedConfig of encodedConfigs) {
    const conf = await config.decode(encodedConfig);
    if (!conf) {
      logger.error("Failed to decode config", encodedConfig);
      continue;
    }
    providedConfigs.push(conf);
  }
  // filter out any falsy configs
  providedConfigs = providedConfigs.filter((c) => !!c);

  if (providedConfigs.length === 0) {
    logger.error("No valid configs provided");
    return c.json({ success: false, message: "No valid configs provided" });
  }

  c.var.logger.info("Creating config flow");

  try {
    const newRecord = await prisma.multiConfig.create({
      data: {
        configs: {
          createMany: {
            data: providedConfigs.map((conf) => ({
              config: JSON.stringify(conf),
              metadata: JSON.stringify([]),
            })),
          },
        },
      },
    });

    // fetch metadata for the lists and update in the background
    providedConfigs
      .filter((c) => !!c)
      .forEach((c) => letterboxdCacher.addList(c));

    const { id } = newRecord;

    return c.json({ success: true, id });
  } catch (error) {
    logger.error("Failed to create config");
    logger.error(error);
  }

  return c.json({ success: false });
});
