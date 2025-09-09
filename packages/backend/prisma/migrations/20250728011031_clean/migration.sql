/*
  Warnings:

  - You are about to drop the column `is_active` on the `user_apikey` table. All the data in the column will be lost.
  - You are about to drop the column `last_used` on the `user_apikey` table. All the data in the column will be lost.
  - You are about to drop the column `usage_count` on the `user_apikey` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_apikey_last_used_idx` ON `user_apikey`;

-- DropIndex
DROP INDEX `user_apikey_user_id_is_active_idx` ON `user_apikey`;

-- AlterTable
ALTER TABLE `user_apikey` DROP COLUMN `is_active`,
    DROP COLUMN `last_used`,
    DROP COLUMN `usage_count`;

-- CreateIndex
CREATE INDEX `vector_id` ON `article`(`vector_id`);

-- CreateIndex
CREATE INDEX `vector_id` ON `interview_summary`(`vector_id`);
