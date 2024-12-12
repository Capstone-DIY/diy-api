/*
  Warnings:

  - You are about to drop the column `updated_at` on the `diary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "diary" DROP COLUMN "updated_at",
ALTER COLUMN "story" SET DATA TYPE TEXT;
