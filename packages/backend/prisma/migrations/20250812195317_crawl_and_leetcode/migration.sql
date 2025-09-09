-- CreateTable
CREATE TABLE `interview_summary_crawled` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_link` VARCHAR(500) NULL,
    `content_hash` VARCHAR(32) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `interview_summary_crawled_post_link_key`(`post_link`),
    UNIQUE INDEX `interview_summary_crawled_content_hash_key`(`content_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `algorithm_question_interview_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `algorithm_question_id` INTEGER NOT NULL,
    `interview_summary_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `algorithm_question_interview_summary_algorithm_question_id_idx`(`algorithm_question_id`),
    INDEX `algorithm_question_interview_summary_interview_summary_id_idx`(`interview_summary_id`),
    UNIQUE INDEX `algorithm_question_interview_summary_algorithm_question_id_i_key`(`algorithm_question_id`, `interview_summary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `algorithm_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(500) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `algorithm_question_link_key`(`link`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `algorithm_question_interview_summary` ADD CONSTRAINT `algorithm_question_interview_summary_algorithm_question_id_fkey` FOREIGN KEY (`algorithm_question_id`) REFERENCES `algorithm_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `algorithm_question_interview_summary` ADD CONSTRAINT `algorithm_question_interview_summary_interview_summary_id_fkey` FOREIGN KEY (`interview_summary_id`) REFERENCES `interview_summary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
