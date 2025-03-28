import type { AppBindingsWithConfig } from "@/util/createHono.js";
import { config } from "@stremio-addon/config";
import { createMiddleware } from "hono/factory";
import { FORBIDDEN } from "stoker/http-status-codes";
import { FORBIDDEN as FORBIDDEN_TEXT } from "stoker/http-status-phrases";

export const parseConfigFromUrl = createMiddleware<AppBindingsWithConfig>(
  async (c, next) => {
    const configString = c.req.param("config");

    try {
      if (configString) {
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
      c.text(FORBIDDEN_TEXT, FORBIDDEN);
    }

    await next();
  }
);
