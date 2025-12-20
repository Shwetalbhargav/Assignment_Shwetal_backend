import type { AuditAction } from "@prisma/client";

export type CreateAuditInput = {
  actorId: string;
  taskId: string;
  action: AuditAction;
  fromValue?: string | null;
  toValue?: string | null;
};

export type ListAuditQuery = {
  taskId?: string;
  actorId?: string;
  action?: AuditAction;
  page?: number;
  limit?: number;
};
