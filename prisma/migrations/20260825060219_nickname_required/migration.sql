/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nickname` on table `users` required. This step will fail if there are existing NULL values in that column.

*/

-- Backfill: nickname未設定の既存ユーザーに仮ハンドルを設定
UPDATE "users" SET "nickname" = 'user_' || "id" WHERE "nickname" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "nickname" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");
