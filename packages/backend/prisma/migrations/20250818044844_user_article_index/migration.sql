-- CreateIndex
CREATE INDEX `user_article_is_favorite_idx` ON `user_article`(`is_favorite`);

-- CreateIndex
CREATE INDEX `user_article_is_master_idx` ON `user_article`(`is_master`);

-- CreateIndex
CREATE INDEX `user_article_upload_to_anki_idx` ON `user_article`(`upload_to_anki`);

-- CreateIndex
CREATE INDEX `user_article_anki_note_id_idx` ON `user_article`(`anki_note_id`);
