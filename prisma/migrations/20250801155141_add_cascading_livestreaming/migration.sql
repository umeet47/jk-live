-- DropForeignKey
ALTER TABLE "LiveStreamParticipant" DROP CONSTRAINT "LiveStreamParticipant_liveStreamId_fkey";

-- DropForeignKey
ALTER TABLE "ProducerActivity" DROP CONSTRAINT "ProducerActivity_liveStreamId_fkey";

-- DropForeignKey
ALTER TABLE "ViewerEngagement" DROP CONSTRAINT "ViewerEngagement_liveStreamId_fkey";

-- AddForeignKey
ALTER TABLE "LiveStreamParticipant" ADD CONSTRAINT "LiveStreamParticipant_liveStreamId_fkey" FOREIGN KEY ("liveStreamId") REFERENCES "LiveStream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerActivity" ADD CONSTRAINT "ProducerActivity_liveStreamId_fkey" FOREIGN KEY ("liveStreamId") REFERENCES "LiveStream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewerEngagement" ADD CONSTRAINT "ViewerEngagement_liveStreamId_fkey" FOREIGN KEY ("liveStreamId") REFERENCES "LiveStream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
