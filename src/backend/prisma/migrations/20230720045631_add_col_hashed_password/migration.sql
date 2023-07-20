/*
  Warnings:

  - You are about to drop the column `uid` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `hashedPassword` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Profile_uid_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "uid",
ADD COLUMN     "hashedPassword" TEXT NOT NULL;
