-- AlterTable
ALTER TABLE `algorithm_question` ADD COLUMN `content_type` VARCHAR(255) NULL,
    ADD COLUMN `hard` VARCHAR(255) NULL,
    ADD COLUMN `job_type` VARCHAR(255) NULL,
    ADD COLUMN `processed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `vector_id` VARCHAR(255) NULL,
    MODIFY `link` VARCHAR(500) NULL,
    MODIFY `name` LONGTEXT NOT NULL;
