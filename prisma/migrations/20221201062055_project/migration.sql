/*
  Warnings:

  - You are about to drop the column `item_is` on the `comments` table. All the data in the column will be lost.
  - Added the required column `item_id` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comments` DROP COLUMN `item_is`,
    ADD COLUMN `item_id` INTEGER NOT NULL;
