-- CreateTable
CREATE TABLE "RoomHistory" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomCreatorId" TEXT NOT NULL,
    "roomCreatorName" TEXT NOT NULL,
    "roomStartTime" TIMESTAMP(3) NOT NULL,
    "roomEndTime" TIMESTAMP(3) NOT NULL,
    "totalRoomDuration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "roomHistoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomHistory" ADD CONSTRAINT "RoomHistory_roomCreatorId_fkey" FOREIGN KEY ("roomCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_roomHistoryId_fkey" FOREIGN KEY ("roomHistoryId") REFERENCES "RoomHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
