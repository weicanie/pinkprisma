-- AlterTable
ALTER TABLE `algorithm_question` ADD COLUMN `origin_content` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `article` ADD COLUMN `model_used` VARCHAR(255) NULL,
    ADD COLUMN `origin_content` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `failed_interview_question` ADD COLUMN `origin_content` LONGTEXT NULL;
