import { createAPIRouter } from "@/util/createHono.js";

export const statsAPIRouter = createAPIRouter();

statsAPIRouter.get("/", (c) => {
  return c.text("0");
});
