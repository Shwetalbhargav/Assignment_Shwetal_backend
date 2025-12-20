import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { getIO } from "../../lib/socket";
import { emitToUser } from "../realtime/realtime.gateway";
import { REALTIME_EVENTS } from "../realtime/realtime.events";
import { NotificationRepository } from "./notification.repo";
import type { CreateNotificationInput, ListNotificationsQuery } from "./notification.types";

export class NotificationsService {
  private repo = new NotificationRepository();

  async create(input: CreateNotificationInput) {
    const data: any = {
      type: input.type,
      message: input.message ?? null,
      taskId: input.taskId ?? null,
      isRead: false,
      user: { connect: { id: input.userId } },
    };

    const created = await this.repo.create(data);

    // realtime push
    try {
      const io = getIO();
      emitToUser(io, input.userId, REALTIME_EVENTS.NOTIFICATION_CREATED, created);
    } catch {}

    return created;
  }

  async listMy(userId: string, query: ListNotificationsQuery) {
    return this.repo.listForUser(userId, query);
  }

  async markMyRead(userId: string, notificationId: string, isRead: boolean) {
    const existing = await this.repo.findById(notificationId);
    if (!existing) throw new AppError("Notification not found", 404, ErrorCodes.NOT_FOUND);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403, ErrorCodes.FORBIDDEN);

    return this.repo.markRead(notificationId, isRead);
  }

  async deleteMy(userId: string, notificationId: string) {
    const existing = await this.repo.findById(notificationId);
    if (!existing) throw new AppError("Notification not found", 404, ErrorCodes.NOT_FOUND);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403, ErrorCodes.FORBIDDEN);

    await this.repo.delete(notificationId);
    return { id: notificationId };
  }
}
