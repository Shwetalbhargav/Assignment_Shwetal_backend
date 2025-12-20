import { z } from "zod";

const priorityHuman = z.enum(["Low", "Medium", "High", "Urgent"]);
const statusHuman = z.enum(["To Do", "In Progress", "Review", "Completed"]);

// also accept Prisma enums (LOW/MEDIUM...)
const priorityDb = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const statusDb = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]);

const priorityEnum = z.union([priorityHuman, priorityDb]);
const statusEnum = z.union([statusHuman, statusDb]);

export const createTaskDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  dueDate: z.string().datetime(),
  priority: priorityEnum,
  status: statusEnum.optional(),
  assignedToId: z.string().min(1),
});

export const updateTaskDto = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  assignedToId: z.string().min(1).optional(),
});

export const listTasksQueryDto = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  sort: z.enum(["dueDateAsc", "dueDateDesc"]).optional(),
});

export const taskIdParamsDto = z.object({
  id: z.string().min(1),
});
