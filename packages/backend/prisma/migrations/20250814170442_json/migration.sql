/*
  Warnings:

  - You are about to alter the column `related_interview_questions` on the `failed_interview_question` table. The data in that column could be lost. The data in that column will be cast from `LongText` to `Json`.

*/
-- AlterTable
ALTER TABLE `failed_interview_question` MODIFY `related_interview_questions` JSON NULL;
