import { createAPIRouter } from "@/util/createHono.js";

export const exampleAPIRouter = createAPIRouter();

exampleAPIRouter.get("/", (c) => {
  return c.json({ message: "GET from example" });
});

exampleAPIRouter.post("/", (c) => {
  return c.json({ message: "POST from example" });
});
