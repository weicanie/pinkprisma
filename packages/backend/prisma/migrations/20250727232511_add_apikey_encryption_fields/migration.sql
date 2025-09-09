-- CreateTable
CREATE TABLE `user_apikey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` VARCHAR(100) NOT NULL,
    `apikey` VARCHAR(500) NOT NULL,
    `iv` VARCHAR(32) NOT NULL,
    `alias` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_used` TIMESTAMP(0) NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `create_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `update_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `user_apikey_user_id_is_active_idx`(`user_id`, `is_active`),
    INDEX `user_apikey_provider_idx`(`provider`),
    INDEX `user_apikey_last_used_idx`(`last_used`),
    UNIQUE INDEX `user_apikey_user_id_provider_alias_key`(`user_id`, `provider`, `alias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
