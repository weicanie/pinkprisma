-- CreateTable
CREATE TABLE `ai_conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `keyname` VARCHAR(100) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `content` JSON NULL,
    `user_id` INTEGER NOT NULL,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_conversation` ADD CONSTRAINT `ai_conversation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
