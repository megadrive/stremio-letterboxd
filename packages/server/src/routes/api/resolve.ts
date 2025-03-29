import { createAPIRouter } from "@/util/createHono.js";

export const resolveAPIRouter = createAPIRouter();

resolveAPIRouter.get("/:encodedUrl", async (c) => {
  const encodedUrl = c.req.param("encodedUrl");
  const decodedUrl = decodeURIComponent(encodedUrl);
  c.var.logger.debug(`resolve ${decodedUrl}`);

  try {
    const res = await fetch(decodedUrl, {
      method: "HEAD",
      redirect: "follow",
      headers: { "cache-control": "no-cache" },
    });
    if (res.ok) {
      return c.text(res.url);
    }
    c.var.logger.error(`Failed to resolve URL: ${res.statusText}`);
    return c.text(res.statusText, 404);
  } catch (error) {
    c.var.logger.error("Failed to get stats", error);
    c.var.logger.error(error);
  }
  return c.text("probably heaps of");
});
