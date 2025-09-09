-- AlterTable
ALTER TABLE `article` ADD COLUMN `change_log` LONGTEXT NULL,
    ADD COLUMN `version` VARCHAR(255) NOT NULL DEFAULT 'v1.0.0';
