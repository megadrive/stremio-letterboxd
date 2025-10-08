/*
  Warnings:

  - You are about to drop the column `configIds` on the `MultiConfig` table. All the data in the column will be lost.
  - Added the required column `multiConfigId` to the `Config` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Config" ADD COLUMN     "multiConfigId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."MultiConfig" DROP COLUMN "configIds";

-- AddForeignKey
ALTER TABLE "public"."Config" ADD CONSTRAINT "Config_multiConfigId_fkey" FOREIGN KEY ("multiConfigId") REFERENCES "public"."MultiConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
