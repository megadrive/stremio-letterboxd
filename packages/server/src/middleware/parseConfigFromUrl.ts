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

function isUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const RESERVED = ["meta", "stream", "subtitles", "catalog", "api"];

export const parseConfigFromUrl = createMiddleware<AppBindingsWithConfig>(
  async (c, next) => {
    const configId = c.req.param("config");

    try {
      if (configId && configId.length) {
        if (RESERVED.includes(configId.toLowerCase())) {
          throw new ConfigWarn(
            `Config is reserved word, ignoring... (${configId} | ${RESERVED})`
          );
        }

        if (!isUUID(configId)) {
          throw new ConfigWarn(`Config is not a valid UUID, ignoring...`);
        }

        let multiConfig = await prisma.multiConfig.findUnique({
          where: {
            id: configId,
          },
          include: {
            configs: true,
          },
        });

        if (!multiConfig) {
          // In the transition period, create a MultiConfig for single configs
          const singleConfig = await prisma.config.findUnique({
            where: {
              id: configId,
            },
            include: {
              parentConfig: true,
            },
          });

          /*
           * Create a MultiConfig if we found a single config and it doesn't already belong to a MultiConfig
           * This is to ensure backward compatibility with existing single configs
           * and to avoid breaking existing links
           * Once we are sure everyone has moved to MultiConfig, we can remove this code
           */
          if (singleConfig && singleConfig.parentConfig === null) {
            const newMultiConfig = await prisma.multiConfig.create({
              data: {
                id: configId,
                configs: {
                  create: [
                    {
                      config: singleConfig.config,
                      metadata: singleConfig.metadata,
                    },
                  ],
                },
              },
              include: {
                configs: true,
              },
            });

            multiConfig = newMultiConfig;

            c.var.logger.info(
              `Created MultiConfig for single config: ${configId}`
            );
          }

          if (!multiConfig) {
            throw new ConfigError(`Config not found for id: ${configId}`);
          }
        }

        const discoveredConfigs: AppBindingsWithConfig["Variables"]["configs"] =
          [];
        for (const cfg of multiConfig.configs) {
          const conf = config.parse(JSON.parse(cfg.config));
          if (!conf) {
            // ignore invalid config
            c.var.logger.error("Failed to decode config, no config returned.", {
              cfg,
            });
            continue;
          }

          discoveredConfigs.push({ config: conf, configString: cfg.config });
        }

        c.set("configId", configId);
        c.set("configs", discoveredConfigs);

        c.var.logger.info(`Parsed config from URL: ${configId}`);
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
