/*
  Warnings:

  - You are about to drop the column `displayName` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uid]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantName` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashedPassword` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "displayName",
ADD COLUMN     "tenantName" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "hashedPassword" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_uid_key" ON "Tenant"("uid");
