import type { AppBindingsWithConfig } from "@/util/createHono.js";
import { config } from "@stremio-addon/config";
import { createMiddleware } from "hono/factory";

export const parseConfigFromUrl = createMiddleware<AppBindingsWithConfig>(
  async (c, next) => {
    const configString = c.req.param("config");

    try {
      if (configString && configString.length) {
        // check if it's a legacy id
        if (configString.length === 36) {
          // c81afd6d-4fef-46a7-b24b-570a423eb26e
          const uuid = configString.split("-");
          if (uuid.length === 5) {
            // lol
            const isLegacyConfig =
              uuid[0].length === 8 &&
              uuid[1].length === 4 &&
              uuid[2].length === 4 &&
              uuid[3].length === 4 &&
              uuid[4].length === 12;
            c.set("isLegacyConfig", isLegacyConfig);

            // for now, make people aware they need to reconfigure
            if (isLegacyConfig) {
              c.var.logger.warn(
                `Legacy config detected, ${configString} is not supported anymore.`
              );
            }
          }
        }

        const conf = await config.decode(configString);

        if (conf) {
          c.set("config", conf);
          c.set("configString", configString);

          c.var.logger.info(`Parsed config from URL: ${JSON.stringify(conf)}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        c.var.logger.error(error);
      }
    }

    await next();
  }
);
