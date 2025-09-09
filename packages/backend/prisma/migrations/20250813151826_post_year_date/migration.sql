-- AlterTable
ALTER TABLE `interview_summary` ADD COLUMN `post_date` DATETIME(3) NULL,
    ADD COLUMN `post_year` INTEGER NULL DEFAULT 2025;

-- AlterTable
ALTER TABLE `interview_summary_crawled` ADD COLUMN `post_date` DATETIME(3) NULL,
    ADD COLUMN `post_year` INTEGER NULL DEFAULT 2025;
