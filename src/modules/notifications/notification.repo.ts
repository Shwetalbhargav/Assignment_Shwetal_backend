import prisma from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ListNotificationsQuery } from "./notification.types";

export class NotificationRepository {
  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  }

  async listForUser(userId: string, query: ListNotificationsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(typeof query.isRead === "boolean" ? { isRead: query.isRead } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
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

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  markRead(id: string, isRead: boolean) {
    return prisma.notification.update({ where: { id }, data: { isRead } });
  }

  delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  }
}
