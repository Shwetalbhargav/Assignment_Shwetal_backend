import { PrismaClient, NotificationType } from "@prisma/client";
import { emitNotification } from "../socket/socket.events";

const prisma = new PrismaClient();

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  message: string;
  taskId?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      taskId: params.taskId,
    },
  });

  // 🔴 realtime + 🟢 persistent
  emitNotification(params.userId, notification);

  return notification;
}
