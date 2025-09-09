/*
  Warnings:

  - You are about to drop the column `user_id` on the `interview_summary` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_id` ON `interview_summary`;

-- AlterTable
ALTER TABLE `interview_summary` DROP COLUMN `user_id`;
