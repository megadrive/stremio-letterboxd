import { createAPIRouter } from "@/util/createHono.js";
import { to } from "await-to-js";

export const resolveAPIRouter = createAPIRouter();

resolveAPIRouter.get("/:encodedUrl", async (c) => {
  const encodedUrl = c.req.param("encodedUrl");
  const decodedUrl = decodeURIComponent(encodedUrl);
  c.var.logger.debug(`resolve ${decodedUrl}`);

  const [resErr, res] = await to(
    fetch(decodedUrl, {
      method: "HEAD",
      redirect: "follow",
      headers: { "cache-control": "no-cache" },
    })
  );

  if (resErr) {
    c.var.logger.error(`Failed to get stats: ${resErr}`);
    return c.text(resErr.message, 500);
  }

  if (!res.ok) {
    c.var.logger.error(`Failed to resolve URL: ${res.statusText}`);
    return c.text(res.statusText, 404);
  }

  return c.text(res.url);
});
