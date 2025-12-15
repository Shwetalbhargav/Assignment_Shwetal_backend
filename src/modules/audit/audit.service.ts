import { PrismaClient, AuditAction } from "@prisma/client";

const prisma = new PrismaClient();

export async function logTaskChange(params: {
  actorId: string;
  taskId: string;
  action: AuditAction;
  fromValue?: string | null;
  toValue?: string | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      taskId: params.taskId,
      action: params.action,
      fromValue: params.fromValue ?? null,
      toValue: params.toValue ?? null,
    },
  });
}
