/*
  Warnings:

  - You are about to drop the column `own` on the `interview_summary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `interview_summary` DROP COLUMN `own`;

-- AlterTable
ALTER TABLE `user_interview_summary` ADD COLUMN `own` BOOLEAN NOT NULL DEFAULT false;
