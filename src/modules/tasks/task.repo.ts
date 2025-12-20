import prisma from "../../lib/prisma";
import type { Prisma, TaskPriority, TaskStatus } from "@prisma/client";

export class TaskRepository {
  create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  list(filters: {
    status?: TaskStatus | undefined;
    priority?: TaskPriority | undefined;
    sort?: "dueDateAsc" | "dueDateDesc" | undefined;
  }) {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const orderBy: Prisma.TaskOrderByWithRelationInput =
      filters.sort === "dueDateDesc" ? { dueDate: "desc" } : { dueDate: "asc" };

    return prisma.task.findMany({
      where,
      orderBy,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  updateById(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  deleteById(id: string) {
    return prisma.task.delete({ where: { id } });
  }
}
