import { parseConfigFromUrl } from "@/middleware/parseConfigFromUrl.js";
import { prisma } from "@stremio-addon/database";
import { Hono } from "hono";

export const verifyRouter = new Hono();

verifyRouter.get("/", parseConfigFromUrl, async (c) => {
  const config = c.var.config;

  // plop it into the db and return the id
  try {
    const inserted = await prisma.config.create({
      data: {
        config: JSON.stringify(config),
      },
    });

    return c.json(inserted.id);
  } catch (error) {
    console.error(error);
  }

  c.header("Cache-Control", "max-age=3600");

  return c.text("no bueno");
});
