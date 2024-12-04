/*
  Warnings:

  - You are about to drop the column `firebaseUid` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebase_uid]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "firebaseUid",
ADD COLUMN     "firebase_uid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_firebase_uid_key" ON "user"("firebase_uid");
