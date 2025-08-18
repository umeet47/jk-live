-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "gifUrl" TEXT,
ALTER COLUMN "videoUrl" DROP NOT NULL;
