import { pino } from "pino";
import { pinoLogger } from "hono-pino";
import pretty from "pino-pretty";
import { serverEnv } from "@stremio-addon/env";

export function pinoLoggerMiddleware() {
  return pinoLogger({
    pino: pino(
      {
        level: serverEnv.isDevelopment ? "debug" : "info",
      },
      serverEnv.isDevelopment ? pretty() : undefined
    ),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
