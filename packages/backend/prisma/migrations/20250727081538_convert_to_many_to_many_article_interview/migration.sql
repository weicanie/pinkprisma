/*
  Warnings:

  - You are about to drop the column `interview_summary_id` on the `article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `article` DROP COLUMN `interview_summary_id`;

-- CreateTable
CREATE TABLE `article_interview_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_id` INTEGER NOT NULL,
    `interview_summary_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `article_interview_summary_article_id_idx`(`article_id`),
    INDEX `article_interview_summary_interview_summary_id_idx`(`interview_summary_id`),
    UNIQUE INDEX `article_interview_summary_article_id_interview_summary_id_key`(`article_id`, `interview_summary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `article_interview_summary` ADD CONSTRAINT `article_interview_summary_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `article_interview_summary` ADD CONSTRAINT `article_interview_summary_interview_summary_id_fkey` FOREIGN KEY (`interview_summary_id`) REFERENCES `interview_summary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
