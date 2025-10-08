-- CreateTable
CREATE TABLE "public"."MultiConfig" (
    "id" TEXT NOT NULL,
    "configIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiConfig_pkey" PRIMARY KEY ("id")
);
