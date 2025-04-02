import type { AppBindingsWithConfig } from "@/util/createHono.js";
import { config } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";
import { createMiddleware } from "hono/factory";

export const parseConfigFromUrl = createMiddleware<AppBindingsWithConfig>(
  async (c, next) => {
    const configId = c.req.param("config");

    try {
      if (configId && configId.length) {
        if (configId === "api") {
          c.var.logger.warn("API config not supported, skipping");
          throw new Error();
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
          throw new Error();
        }

        const conf = await config.decode(cachedConfig.config);

        if (conf) {
          c.set("config", conf);
          c.set("configString", cachedConfig.config);

          c.var.logger.info(`Parsed config from URL: ${configId}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        c.var.logger.error(error.message);
      }
    }

    await next();
  }
);
