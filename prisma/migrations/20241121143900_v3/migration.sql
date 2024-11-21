-- DropForeignKey
ALTER TABLE "Analytic" DROP CONSTRAINT "Analytic_id_fkey";

-- DropForeignKey
ALTER TABLE "Diary" DROP CONSTRAINT "Diary_id_fkey";

-- AlterTable
ALTER TABLE "Analytic" ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "quotes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Diary" ADD COLUMN     "favorited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Diary" ADD CONSTRAINT "Diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytic" ADD CONSTRAINT "Analytic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
