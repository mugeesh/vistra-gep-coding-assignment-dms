/*
  Warnings:

  - Made the column `created_by` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `documents` MODIFY `created_by` VARCHAR(255) NOT NULL DEFAULT '-';
