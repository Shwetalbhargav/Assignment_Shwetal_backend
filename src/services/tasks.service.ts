import { PrismaClient } from "@prisma/client";
import { emitTaskUpdated, emitTaskAssigned } from "../modules/socket/socket.events";

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string | null;
  dueDate?: string | Date | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string | null;
  dueDate?: string | Date | null;
};

export class TasksService {
  constructor(private prisma: PrismaClient = new PrismaClient()) {}

  async createTask(input: CreateTaskInput, currentUserId: string) {
    const created = await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status: (input.status as any) ?? undefined,
        priority: (input.priority as any) ?? undefined,
        assignedToId: input.assignedToId ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        // If you have createdById in schema, uncomment:
        // createdById: currentUserId,
      } as any,
    });

    emitTaskUpdated(created);

    if (created.assignedToId) {
      emitTaskAssigned(created.assignedToId, {
        taskId: created.id,
        title: created.title,
        assignedBy: currentUserId,
      });
    }

    return created;
  }

  async listTasks() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: "desc" } as any,
    });
  }

  async getTaskById(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) throw Object.assign(new Error("Task not found"), { status: 404 });
    return task;
  }

  async updateTask(taskId: string, updateData: UpdateTaskInput, currentUserId: string) {
    const oldTask = await this.getTaskById(taskId);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: updateData.title ?? undefined,
        description: updateData.description ?? undefined,
        status: (updateData.status as any) ?? undefined,
        priority: (updateData.priority as any) ?? undefined,
        assignedToId: updateData.assignedToId ?? undefined,
        dueDate:
          updateData.dueDate === null
            ? null
            : updateData.dueDate
            ? new Date(updateData.dueDate)
            : undefined,
      } as any,
    });

    emitTaskUpdated(updated);

    const newAssignee = updateData.assignedToId;
    if (newAssignee && newAssignee !== (oldTask as any).assignedToId) {
      emitTaskAssigned(newAssignee, {
        taskId: updated.id,
        title: updated.title,
        assignedBy: currentUserId,
      });
    }

    return updated;
  }

  async assignTask(taskId: string, assignedToId: string, currentUserId: string) {
    const oldTask = await this.getTaskById(taskId);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { assignedToId },
    });

    emitTaskUpdated(updated);

    if (assignedToId !== (oldTask as any).assignedToId) {
      emitTaskAssigned(assignedToId, {
        taskId: updated.id,
        title: updated.title,
        assignedBy: currentUserId,
      });
    }

    return updated;
  }

  async deleteTask(taskId: string) {
    await this.getTaskById(taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { ok: true as const };
  }
}
