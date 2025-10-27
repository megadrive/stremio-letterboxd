import { pino } from "pino";
import { pinoLogger } from "hono-pino";
import pretty from "pino-pretty";
import { serverEnv } from "@stremio-addon/env";

const transports = pino.transport({
  targets: [
    {
      target: "pino/file",
    },
    ...(serverEnv.ELASTICSEARCH_URL.length
      ? [
          {
            target: "pino-elasticsearch",
            options: {
              index: "stremio-addon",
              node: serverEnv.ELASTICSEARCH_URL,
            },
          },
        ]
      : []),
  ],
});

export function pinoLoggerMiddleware() {
  return pinoLogger({
    pino: pino(
      {
        level: serverEnv.isDevelopment ? "debug" : "info",
      },
      serverEnv.isDevelopment ? pretty() : transports
    ),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}

export const pinoLoggerStandalone = pino(
  {
    level: serverEnv.isDevelopment ? "debug" : "info",
  },
  serverEnv.isDevelopment ? pretty() : transports
);
