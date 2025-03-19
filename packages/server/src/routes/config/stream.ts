import { createRouter } from "@/util/createHono.js";
import type { Stream } from "stremio-addon-sdk";

export const streamRouter = createRouter();

streamRouter.get("/:type/:id.json", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");

  console.log({ type, id });

  // Do some logic here to determine what streams to return based on the type and id

  const streamExample: Stream[] = [
    {
      name: "An example stream that shows up on everything",
      ytId: "dQw4w9WgXcQ",
    },
  ];

  return c.json({ streams: streamExample });
});
