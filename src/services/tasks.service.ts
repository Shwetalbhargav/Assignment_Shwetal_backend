import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class TasksService {
  async createTask(userId: string, input: {
    title: string;
    description?: string | null;
    dueDate: Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedToId?: string | null;
  }) {
    // If assignedToId present, ensure user exists
    if (input.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
      if (!assignee) throw Object.assign(new Error("Assignee not found"), { status: 404 });
    }

    return prisma.task.create({
  data: {
    title: input.title,
    description: input.description ?? null,
    dueDate: input.dueDate,
    priority: input.priority ?? "MEDIUM",
    status: input.status ?? "TODO",
    creatorId: userId,
    assignedToId: input.assignedToId ?? null,
  },
  include: { creator: true, assignedTo: true },
});

  }

  async listTasks(userId: string, query: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    creatorId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    // Typical: show tasks where user is creator OR assignee
    const baseVisibility = {
      OR: [{ creatorId: userId }, { assignedToId: userId }],
    };

    const where: any = {
      ...baseVisibility,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assignedToId ? { assignedToId: query.assignedToId } : {}),
      ...(query.creatorId ? { creatorId: query.creatorId } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { creator: true, assignedTo: true },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { creator: true, assignedTo: true },
    });
    if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });

    // Visibility: creator or assignee
    if (task.creatorId !== userId && task.assignedToId !== userId) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
    return task;
  }

  private ensureCreator(task: { creatorId: string }, userId: string) {
    if (task.creatorId !== userId) throw Object.assign(new Error("Only creator can do this"), { status: 403 });
  }

  private ensureCreatorOrAssignee(task: { creatorId: string; assignedToId: string | null }, userId: string) {
    if (task.creatorId !== userId && task.assignedToId !== userId) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  async updateTask(userId: string, taskId: string, patch: any) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw Object.assign(new Error("Task not found"), { status: 404 });

    // Decide your rule:
    // - creator or assignee can update basic fields (status/priority/title/etc)
    this.ensureCreatorOrAssignee(existing, userId);

    // But re-assign should be creator-only (prevents assignee from re-assigning away)
    if ("assignedToId" in patch) this.ensureCreator(existing, userId);

    // If changing assignee, validate target user exists
    if (patch.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: patch.assignedToId } });
      if (!assignee) throw Object.assign(new Error("Assignee not found"), { status: 404 });
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.assignedToId !== undefined ? { assignedToId: patch.assignedToId } : {}),
      },
      include: { creator: true, assignedTo: true },
    });
  }

  async assignTask(userId: string, taskId: string, assignedToId: string | null) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw Object.assign(new Error("Task not found"), { status: 404 });

    // Assign/unassign creator-only
    this.ensureCreator(existing, userId);

    if (assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
      if (!assignee) throw Object.assign(new Error("Assignee not found"), { status: 404 });
    }

    return prisma.task.update({
      where: { id: taskId },
      data: { assignedToId },
      include: { creator: true, assignedTo: true },
    });
  }

  async deleteTask(userId: string, taskId: string) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw Object.assign(new Error("Task not found"), { status: 404 });

    this.ensureCreator(existing, userId);

    await prisma.task.delete({ where: { id: taskId } });
    return { ok: true };
  }
}
