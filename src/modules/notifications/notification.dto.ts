import { z } from "zod";

export const notificationTypeEnum = z.enum(["TASK_ASSIGNED", "TASK_UPDATED"]);

export const createNotificationDto = z.object({
  userId: z.string().min(1),
  type: notificationTypeEnum,
  message: z.string().max(2000).nullable().optional(),
  taskId: z.string().min(1).nullable().optional(),
});

export const listNotificationsQueryDto = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  isRead: z.coerce.boolean().optional(),
});

export const idParamsDto = z.object({
  id: z.string().min(1),
});

export const markReadBodyDto = z.object({
  isRead: z.boolean(),
});

// ✅ Params DTO for /notifications/:id/read
export const markReadParamsDto = z.object({
  id: z.string().min(1, "Notification id is required"),
});

export type MarkReadParamsDto = z.infer<typeof markReadParamsDto>;