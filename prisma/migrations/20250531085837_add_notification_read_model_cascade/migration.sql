-- DropForeignKey
ALTER TABLE "NotificationRead" DROP CONSTRAINT "NotificationRead_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRead" DROP CONSTRAINT "NotificationRead_userId_fkey";

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
