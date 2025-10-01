import type { AppBindingsWithConfig } from "@/util/createHono.js";
import { config } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";
import { createMiddleware } from "hono/factory";

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

class ConfigWarn extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigWarn";
  }
}

export const parseConfigFromUrl = createMiddleware<AppBindingsWithConfig>(
  async (c, next) => {
    const configId = c.req.param("config");

    try {
      if (configId && configId.length) {
        if (configId === "api") {
          throw new ConfigWarn(`API config not supported, ignoring...`);
        }

        const cachedConfig = await prisma.config.findFirst({
          where: {
            OR: [
              {
                // could be a uuid
                id: configId,
              },
              {
                // could be a base64 encoded config
                config: configId,
              },
            ],
          },
        });

        if (!cachedConfig) {
          c.var.logger.warn(`Config not found for id: ${configId}`);

          // try to decode the configId as base64
          const decodedConfig = await config.decode(configId);
          if (decodedConfig) {
            c.set("config", decodedConfig);
            c.set("configString", configId);

            c.var.logger.info(`Parsed config from base64: ${configId}`);
            throw new ConfigWarn(`Parsed config from base64: ${configId}`);
          }

          throw new ConfigError(`Config not found for id: ${configId}`);
        }

        const conf = await config.decode(cachedConfig.config);

        if (conf) {
          c.set("config", conf);
          c.set("configString", cachedConfig.config);

          c.var.logger.info(`Parsed config from URL: ${configId}`);
        }
      }
    } catch (error) {
      if (error instanceof ConfigError) {
        c.var.logger.error(error.message);
      }
      if (error instanceof ConfigWarn) {
        c.var.logger.warn(error.message);
      } else {
        c.var.logger.error(error);
      }
    }

    c.set("configId", configId);
    await next().catch(() => {});
  }
);
