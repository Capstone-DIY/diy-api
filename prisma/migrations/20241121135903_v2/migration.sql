/*
  Warnings:

  - The primary key for the `Analytic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `analyticId` on the `Analytic` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Analytic` table. All the data in the column will be lost.
  - The primary key for the `Diary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `diaryId` on the `Diary` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Diary` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Analytic" DROP CONSTRAINT "Analytic_userId_fkey";

-- DropForeignKey
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_userId_fkey";

-- AlterTable
ALTER TABLE "Analytic" DROP CONSTRAINT "Analytic_pkey",
DROP COLUMN "analyticId",
DROP COLUMN "userId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Analytic_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_pkey",
DROP COLUMN "diaryId",
DROP COLUMN "userId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Diary_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytic" ADD CONSTRAINT "Analytic_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
