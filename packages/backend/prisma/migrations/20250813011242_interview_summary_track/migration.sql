-- AlterTable
ALTER TABLE `interview_summary` ADD COLUMN `success_article_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_article_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `interview_summary_crawled` ADD COLUMN `processed` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `failed_interview_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vector_id` VARCHAR(255) NULL,
    `content` LONGTEXT NULL,
    `interview_summary_id` INTEGER NOT NULL,
    `success` BOOLEAN NOT NULL DEFAULT false,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
