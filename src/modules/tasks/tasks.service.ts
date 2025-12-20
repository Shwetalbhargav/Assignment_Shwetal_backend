import type { NotificationType, TaskPriority, TaskStatus } from "@prisma/client";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { getIO } from "../../lib/socket";
import { TaskRepository } from "./task.repo";
import type { CreateTaskInput, UpdateTaskInput, ListTasksFilter } from "./task.types";
import { toPrismaPriority, toPrismaStatus } from "./tasks.mappers";

import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";

import { emitToUser } from "../realtime/realtime.gateway";
import { REALTIME_EVENTS } from "../realtime/realtime.events";

export class TasksService {
  private repo = new TaskRepository();
  private audit = new AuditService();
  private notifications = new NotificationsService();

  async list(filters: ListTasksFilter) {
    return this.repo.list(filters);
  }

  async getById(id: string) {
    const task = await this.repo.findById(id);
    if (!task) throw new AppError("Task not found", 404, ErrorCodes.NOT_FOUND);
    return task;
  }

  async create(creatorId: string, input: CreateTaskInput) {
    const data: any = {
      title: input.title.trim(),
      dueDate: new Date(input.dueDate),
      priority: toPrismaPriority(input.priority as unknown as string) as TaskPriority,
      status: input.status
        ? (toPrismaStatus(input.status as unknown as string) as TaskStatus)
        : ("TODO" as TaskStatus),
      creator: { connect: { id: creatorId } },
    };

    // description is optional in schema
    if (typeof input.description === "string" && input.description.trim().length > 0) {
      data.description = input.description;
    } else {
      data.description = null;
    }

    // assignedToId is optional in schema
    if (typeof input.assignedToId === "string" && input.assignedToId.trim().length > 0) {
      data.assignedTo = { connect: { id: input.assignedToId } };
    }

    const task = await this.repo.create(data);

    // ✅ AUDIT: assignment if assigned
    if (task.assignedToId) {
      await this.audit.create({
        actorId: creatorId,
        taskId: task.id,
        action: "TASK_ASSIGNED",
        fromValue: null,
        toValue: task.assignedToId,
      });

      // ✅ NOTIFICATION: assignment (mandatory requirement)
      await this.notifications.create({
        userId: task.assignedToId,
        type: "TASK_ASSIGNED" as NotificationType,
        message: `You were assigned a task: ${task.title}`,
        taskId: task.id,
      });
    }

    // ✅ REALTIME
    try {
      const io = getIO();
      io.emit(REALTIME_EVENTS.TASK_CREATED, task);
      if (task.assignedToId) {
        emitToUser(io, task.assignedToId, REALTIME_EVENTS.TASK_ASSIGNED, task);
      }
    } catch {}

    return task;
  }

  async update(taskId: string, actorUserId: string, input: UpdateTaskInput) {
    const existing = await this.repo.findById(taskId);
    if (!existing) throw new AppError("Task not found", 404, ErrorCodes.NOT_FOUND);

    const prevStatus = existing.status;
    const prevPriority = existing.priority;
    const prevAssigneeId = existing.assignedToId ?? null;

    const data: any = {};

    if (typeof input.title === "string") data.title = input.title.trim();

    // description optional in schema
    if ("description" in input) {
      if (typeof input.description === "string" && input.description.trim().length > 0) {
        data.description = input.description;
      } else {
        data.description = null;
      }
    }

    if (typeof input.dueDate === "string") data.dueDate = new Date(input.dueDate);

    if (input.priority) {
      data.priority = toPrismaPriority(input.priority as unknown as string) as TaskPriority;
    }

    if (input.status) {
      data.status = toPrismaStatus(input.status as unknown as string) as TaskStatus;
    }

    // assignedToId optional in schema: allow null to unassign
    if ("assignedToId" in input) {
      const v = input.assignedToId;
      if (typeof v === "string" && v.trim().length > 0) {
        data.assignedTo = { connect: { id: v } };
      } else {
        data.assignedTo = { disconnect: true };
      }
    }

    const updated = await this.repo.updateById(taskId, data);

    const nextStatus = updated.status;
    const nextPriority = updated.priority;
    const nextAssigneeId = updated.assignedToId ?? null;

    // ✅ AUDIT: status change
    if (prevStatus !== nextStatus) {
      await this.audit.create({
        actorId: actorUserId,
        taskId: updated.id,
        action: "TASK_STATUS_CHANGED",
        fromValue: String(prevStatus),
        toValue: String(nextStatus),
      });

      // Optional but nice: notify assignee when status changes
      if (nextAssigneeId) {
        await this.notifications.create({
          userId: nextAssigneeId,
          type: "TASK_UPDATED" as NotificationType,
          message: `Task status updated: ${updated.title}`,
          taskId: updated.id,
        });
      }
    }

    // ✅ AUDIT: priority change
    if (prevPriority !== nextPriority) {
      await this.audit.create({
        actorId: actorUserId,
        taskId: updated.id,
        action: "TASK_PRIORITY_CHANGED",
        fromValue: String(prevPriority),
        toValue: String(nextPriority),
      });

      // Optional notification
      if (nextAssigneeId) {
        await this.notifications.create({
          userId: nextAssigneeId,
          type: "TASK_UPDATED" as NotificationType,
          message: `Task priority updated: ${updated.title}`,
          taskId: updated.id,
        });
      }
    }

    // ✅ AUDIT + NOTIFICATION: assignee change
    if (prevAssigneeId !== nextAssigneeId) {
      await this.audit.create({
        actorId: actorUserId,
        taskId: updated.id,
        action: "TASK_ASSIGNED",
        fromValue: prevAssigneeId,
        toValue: nextAssigneeId,
      });

      if (nextAssigneeId) {
        await this.notifications.create({
          userId: nextAssigneeId,
          type: "TASK_ASSIGNED" as NotificationType,
          message: `You were assigned a task: ${updated.title}`,
          taskId: updated.id,
        });
      }
    }

    // ✅ REALTIME
    try {
      const io = getIO();
      io.emit(REALTIME_EVENTS.TASK_UPDATED, updated);

      if (nextAssigneeId && prevAssigneeId !== nextAssigneeId) {
        emitToUser(io, nextAssigneeId, REALTIME_EVENTS.TASK_ASSIGNED, updated);
      }
    } catch {}

    return updated;
  }

  async remove(taskId: string) {
    const existing = await this.repo.findById(taskId);
    if (!existing) throw new AppError("Task not found", 404, ErrorCodes.NOT_FOUND);

    await this.repo.deleteById(taskId);

    try {
      const io = getIO();
      io.emit(REALTIME_EVENTS.TASK_DELETED, { id: taskId });
    } catch {}

    return { id: taskId };
  }
}
