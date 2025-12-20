import type { TaskPriority, TaskStatus } from "@prisma/client";

export type CreateTaskInput = {
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: TaskPriority;
  status?: TaskStatus;
  assignedToId: string;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  dueDate: string; // ISO
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
}>;

export type ListTasksFilter = {
  status?: TaskStatus | undefined;
  priority?: TaskPriority | undefined;
  sort?: "dueDateAsc" | "dueDateDesc" | undefined;
};
