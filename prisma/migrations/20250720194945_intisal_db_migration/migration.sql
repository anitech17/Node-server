/*
  Warnings:

  - Added the required column `class` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `educator_id` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "class" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "educator_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "Educator"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
