import type { TaskPriority, TaskStatus } from "@prisma/client";

/**
 * What the client sends to POST /api/tasks
 * (validated by createTaskSchema)
 */
export type CreateTaskDto = {
  title: string;
  description?: string;
  dueDate: Date;

  priority?: TaskPriority; // default handled by Prisma if omitted
  status?: TaskStatus;     // default handled by Prisma if omitted

  assignedToId?: string | null;
};

/**
 * What the client sends to PATCH /api/tasks/:taskId
 * (validated by updateTaskSchema)
 */
export type UpdateTaskDto = {
  title?: string;
  description?: string | null;
  dueDate?: Date;

  priority?: TaskPriority;
  status?: TaskStatus;

  assignedToId?: string | null;
};

/**
 * What the client sends to PATCH /api/tasks/:taskId/assign
 * (validated by assignTaskSchema)
 */
export type AssignTaskDto = {
  assignedToId: string | null; // null = unassign
};

/**
 * Shape you return back to client (optional, but nice to standardize)
 */
export type TaskResponseDto = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;

  priority: TaskPriority;
  status: TaskStatus;

  creatorId: string;
  assignedToId: string | null;

  createdAt: Date;
  updatedAt: Date;
};
