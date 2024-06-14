import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | undefined = undefined;

export const prisma = (() => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
})();
