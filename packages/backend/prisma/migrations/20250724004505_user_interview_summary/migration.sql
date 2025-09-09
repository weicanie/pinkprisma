-- DropForeignKey
ALTER TABLE `interview_summary` DROP FOREIGN KEY `interview_summary_user_id_fkey`;

-- CreateTable
CREATE TABLE `user_interview_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `interview_summary_id` INTEGER NOT NULL,

    INDEX `user_interview_summary_user_id_idx`(`user_id`),
    INDEX `user_interview_summary_interview_summary_id_idx`(`interview_summary_id`),
    UNIQUE INDEX `user_interview_summary_user_id_interview_summary_id_key`(`user_id`, `interview_summary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_interview_summary` ADD CONSTRAINT `user_interview_summary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interview_summary` ADD CONSTRAINT `user_interview_summary_interview_summary_id_fkey` FOREIGN KEY (`interview_summary_id`) REFERENCES `interview_summary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
