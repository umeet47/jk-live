-- CreateTable
CREATE TABLE "LiveStreamParticipant" (
    "id" TEXT NOT NULL,
    "liveStreamId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'participant',
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveStreamParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LiveStreamParticipant" ADD CONSTRAINT "LiveStreamParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamParticipant" ADD CONSTRAINT "LiveStreamParticipant_liveStreamId_fkey" FOREIGN KEY ("liveStreamId") REFERENCES "LiveStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
