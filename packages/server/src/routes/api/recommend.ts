import { createAPIRouter } from "@/util/createHono.js";
import { ListManager } from "@/util/listManager.js";
import { NOT_FOUND } from "stoker/http-status-codes";

const lists = new ListManager();
lists.startPolling();

export const recommendAPIRouter = createAPIRouter();

recommendAPIRouter.get("/", (c) => {
  const recommendation = lists.recommend();

  if (!recommendation) {
    return c.json({ error: "No recommendation found" }, NOT_FOUND);
  }

  return c.json({ recommendation });
});
