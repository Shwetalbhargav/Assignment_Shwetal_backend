import type { NotificationType } from "@prisma/client";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  message?: string | null;
  taskId?: string | null;
};

export type ListNotificationsQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};
