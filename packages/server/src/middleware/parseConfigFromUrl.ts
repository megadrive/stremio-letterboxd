import { config, type Config } from "@stremio-addon/config";
import { prisma } from "@stremio-addon/database";
import { createMiddleware } from "hono/factory";

export const parseConfigFromUrl = createMiddleware<{
  Variables: { config: Config };
}>(async (c, next) => {
  const configId = c.req.param("config");
  if (!configId) return c.json({ error: "No config provided" });

  try {
    const cachedConfig = await prisma.config.findUnique({
      where: {
        id: configId,
      },
    });

    if (!cachedConfig) {
      throw new Error(`Could not find config with id ${configId}`);
    }

    // decode the found config
    const decodedConfig = await config.decode(cachedConfig.config);

    if (!decodedConfig) {
      throw new Error(`Could not decode config with id ${configId}`);
    }
  } catch (error) {
    console.error(error);
    return c.text("", 500);
  }

  await next();
});
