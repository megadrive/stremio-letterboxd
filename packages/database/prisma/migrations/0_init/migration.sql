-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Cinemeta" (
    "id" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cinemeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Config" (
    "id" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "isReserved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shuffleSeedId" TEXT,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Film" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "runtime" INTEGER,
    "description" TEXT,
    "genres" TEXT,
    "director" TEXT,
    "cast" TEXT,
    "imdb" TEXT,
    "tmdb" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Poster" (
    "id" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "altId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShuffleSeed" (
    "id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShuffleSeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_config_key" ON "public"."Config"("config");

-- CreateIndex
CREATE UNIQUE INDEX "Config_shuffleSeedId_key" ON "public"."Config"("shuffleSeedId");

-- CreateIndex
CREATE INDEX "Config_config_idx" ON "public"."Config"("config");

-- CreateIndex
CREATE UNIQUE INDEX "Film_imdb_tmdb_key" ON "public"."Film"("imdb", "tmdb");

-- CreateIndex
CREATE INDEX "Poster_filmId_altId_idx" ON "public"."Poster"("filmId", "altId");

-- CreateIndex
CREATE UNIQUE INDEX "ShuffleSeed_configId_key" ON "public"."ShuffleSeed"("configId");

-- CreateIndex
CREATE INDEX "ShuffleSeed_seed_idx" ON "public"."ShuffleSeed"("seed");

-- AddForeignKey
ALTER TABLE "public"."ShuffleSeed" ADD CONSTRAINT "ShuffleSeed_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."Config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

