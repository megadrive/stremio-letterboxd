import { PrismaClient } from "@prisma/client";

let prismaClient;

export const prisma = (() => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }

  return prismaClient;
})();
