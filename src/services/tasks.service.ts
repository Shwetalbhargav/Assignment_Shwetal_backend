import { PrismaClient } from "@prisma/client";
import { emitTaskUpdated, emitTaskAssigned } from "../modules/socket/socket.events";
import { logTaskChange } from "../audit/audit.service";
import { AuditAction } from "@prisma/client";
import { logTaskChange } from "../modules/audit/audit.service";


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

    if (updated.assignedToId && updated.assignedToId !== old.assignedToId) {
      await createNotification({
        userId: updated.assignedToId,
        type: "TASK_ASSIGNED",
        message: `You were assigned task "${updated.title}"`,
        taskId: updated.id,
  });

        if (
              updated.status !== old.status ||
              updated.priority !== old.priority
            ) {
              await createNotification({
                userId: updated.creatorId,
                type: "TASK_UPDATED",
                message: `Task "${updated.title}" was updated`,
                taskId: updated.id,
        });
}

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

          // ✅ Audit logs (only when relevant fields change)
          const auditPromises: Promise<any>[] = [];

          if ((updateData as any).status !== undefined && (updated as any).status !== (oldTask as any).status) {
            auditPromises.push(
              logTaskChange({
                actorId: currentUserId,
                taskId: updated.id,
                action: AuditAction.TASK_STATUS_CHANGED,
                fromValue: String((oldTask as any).status),
                toValue: String((updated as any).status),
              })
            );
          }

          if ((updateData as any).priority !== undefined && (updated as any).priority !== (oldTask as any).priority) {
            auditPromises.push(
              logTaskChange({
                actorId: currentUserId,
                taskId: updated.id,
                action: AuditAction.TASK_PRIORITY_CHANGED,
                fromValue: String((oldTask as any).priority),
                toValue: String((updated as any).priority),
              })
            );
          }

          if ((updateData as any).assignedToId !== undefined && (updated as any).assignedToId !== (oldTask as any).assignedToId) {
            auditPromises.push(
              logTaskChange({
                actorId: currentUserId,
                taskId: updated.id,
                action: AuditAction.TASK_ASSIGNED,
                fromValue: (oldTask as any).assignedToId ? String((oldTask as any).assignedToId) : null,
                toValue: (updated as any).assignedToId ? String((updated as any).assignedToId) : null,
              })
            );
          }

          // Don’t block sockets if audit logging fails — but usually safe to await
          await Promise.all(auditPromises);

          // 🔴 Live update
          emitTaskUpdated(updated);

          // 🔔 Assignment live ping (your existing behavior)
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


        async assignTask(taskId: string, assignedToId: string | null, currentUserId: string) {
        const oldTask = await this.getTaskById(taskId);

        const updated = await this.prisma.task.update({
          where: { id: taskId },
          data: { assignedToId },
        });

        // ✅ Audit (only if changed)
        if ((updated as any).assignedToId !== (oldTask as any).assignedToId) {
          await logTaskChange({
            actorId: currentUserId,
            taskId: updated.id,
            action: AuditAction.TASK_ASSIGNED,
            fromValue: (oldTask as any).assignedToId ? String((oldTask as any).assignedToId) : null,
            toValue: (updated as any).assignedToId ? String((updated as any).assignedToId) : null,
          });
        }

        emitTaskUpdated(updated);

        if (assignedToId && assignedToId !== (oldTask as any).assignedToId) {
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
