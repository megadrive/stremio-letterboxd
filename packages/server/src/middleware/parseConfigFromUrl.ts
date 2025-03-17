import { config, type Config } from "@stremio-addon/config";
import { createMiddleware } from "hono/factory";

export const parseConfigFromUrl = createMiddleware<{
  Variables: { config: Config };
}>(async (c, next) => {
  const configString = c.req.param("config");

  try {
    if (configString) {
      const conf = await config.decode(configString);
      if (!conf) throw new Error("Invalid config");
      c.set("config", conf);
    }
  } catch (error) {
    console.error(error);
    c.text("", 500);
  }

  await next();
});
