import { PrismaClient, NotificationType } from "@prisma/client";
import { emitNotificationNew } from "../modules/socket/socket.events";

export class NotificationsService {
  constructor(private prisma: PrismaClient = new PrismaClient()) {}

  async createTaskAssignedNotification(params: {
    userId: string;
    taskId: string;
    taskTitle: string;
    assignedBy: string;
  }) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: NotificationType.TASK_ASSIGNED,
        title: "New task assigned",
        message: `You were assigned: ${params.taskTitle}`,
        data: {
          taskId: params.taskId,
          assignedBy: params.assignedBy,
        },
      },
    });

    // real-time push
    emitNotificationNew(params.userId, notif);

    return notif;
  }

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(userId: string, notificationId: string) {
    // ensures user can only mark their own notification
    const updated = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });

    if (updated.count === 0) {
      throw Object.assign(new Error("Notification not found"), { status: 404 });
    }
    return { ok: true as const };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true as const };
  }
}
