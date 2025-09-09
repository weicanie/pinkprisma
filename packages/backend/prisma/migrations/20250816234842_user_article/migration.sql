-- AlterTable
ALTER TABLE `user_article` ADD COLUMN `is_favorite` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_master` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `note` LONGTEXT NULL;
