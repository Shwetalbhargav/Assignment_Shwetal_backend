import prisma from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ListAuditQuery } from "./audit.types";

export class AuditRepository {
  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({ data });
  }

  async list(query: ListAuditQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (query.taskId) where.taskId = query.taskId;
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = query.action;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
