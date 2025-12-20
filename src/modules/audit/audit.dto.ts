import { z } from "zod";

export const auditActionEnum = z.enum([
  "TASK_STATUS_CHANGED",
  "TASK_PRIORITY_CHANGED",
  "TASK_ASSIGNED",
]);

export const createAuditDto = z.object({
  taskId: z.string().min(1),
  action: auditActionEnum,
  fromValue: z.string().nullable().optional(),
  toValue: z.string().nullable().optional(),
});

export const listAuditQueryDto = z.object({
  taskId: z.string().min(1).optional(),
  actorId: z.string().min(1).optional(),
  action: auditActionEnum.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
