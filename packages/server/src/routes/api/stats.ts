import { createAPIRouter } from "@/util/createHono.js";
import { prisma } from "@stremio-addon/database";

export const statsAPIRouter = createAPIRouter();

statsAPIRouter.get("/", async (c) => {
  try {
    const stats = await prisma.config.count();
    c.header("Cache-Control", "max-age=3600, s-maxage=3600, public");
    return c.text(`${stats}`);
  } catch (error) {
    c.var.logger.error("Failed to get stats", error);
    c.var.logger.error(error);
  }
  return c.text("probably heaps of");
});
