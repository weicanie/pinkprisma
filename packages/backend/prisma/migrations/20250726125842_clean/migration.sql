/*
  Warnings:

  - You are about to drop the `ai_conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_file_chunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ai_conversation` DROP FOREIGN KEY `ai_conversation_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_file` DROP FOREIGN KEY `project_file_user_project_id_fkey`;

-- DropForeignKey
ALTER TABLE `project_file_chunk` DROP FOREIGN KEY `project_file_chunk_project_file_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_project` DROP FOREIGN KEY `user_project_user_id_fkey`;

-- DropTable
DROP TABLE `ai_conversation`;

-- DropTable
DROP TABLE `project_file`;

-- DropTable
DROP TABLE `project_file_chunk`;

-- DropTable
DROP TABLE `user_project`;
