-- CreateTable
CREATE TABLE `related_interview_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_id` INTEGER NOT NULL,
    `related_article_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `related_interview_question_article_id_idx`(`article_id`),
    INDEX `related_interview_question_related_article_id_idx`(`related_article_id`),
    UNIQUE INDEX `related_interview_question_article_id_related_article_id_key`(`article_id`, `related_article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `related_interview_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `interview_summary_id` INTEGER NOT NULL,
    `related_interview_summary_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `related_interview_summary_interview_summary_id_idx`(`interview_summary_id`),
    INDEX `related_interview_summary_related_interview_summary_id_idx`(`related_interview_summary_id`),
    UNIQUE INDEX `related_interview_summary_interview_summary_id_related_inter_key`(`interview_summary_id`, `related_interview_summary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `related_interview_question` ADD CONSTRAINT `related_interview_question_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_interview_question` ADD CONSTRAINT `related_interview_question_related_article_id_fkey` FOREIGN KEY (`related_article_id`) REFERENCES `article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_interview_summary` ADD CONSTRAINT `related_interview_summary_interview_summary_id_fkey` FOREIGN KEY (`interview_summary_id`) REFERENCES `interview_summary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_interview_summary` ADD CONSTRAINT `related_interview_summary_related_interview_summary_id_fkey` FOREIGN KEY (`related_interview_summary_id`) REFERENCES `interview_summary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
