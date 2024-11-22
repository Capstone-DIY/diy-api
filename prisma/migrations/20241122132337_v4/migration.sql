/*
  Warnings:

  - You are about to drop the `Analytic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Diary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Analytic" DROP CONSTRAINT "Analytic_userId_fkey";

-- DropForeignKey
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_userId_fkey";

-- DropTable
DROP TABLE "Analytic";

-- DropTable
DROP TABLE "Diary";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "dob" DATE,
    "gender" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diary" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "story" VARCHAR(254) NOT NULL,
    "emotion" TEXT,
    "response" TEXT,
    "favorited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "diary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytic" (
    "id" SERIAL NOT NULL,
    "total_diary" INTEGER NOT NULL DEFAULT 0,
    "quotes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "analytic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "diary" ADD CONSTRAINT "diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytic" ADD CONSTRAINT "analytic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
