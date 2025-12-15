import { z } from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";

// Mongo ObjectId validator
export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

// ✅ Use Prisma enums directly
export const TaskPrioritySchema = z.nativeEnum(TaskPriority);
export const TaskStatusSchema = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  dueDate: z.coerce.date(),

  priority: TaskPrioritySchema.optional(),
  status: TaskStatusSchema.optional(),

  assignedToId: objectId.optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional().nullable(),
  dueDate: z.coerce.date().optional(),

  priority: TaskPrioritySchema.optional(),
  status: TaskStatusSchema.optional(),

  assignedToId: objectId.optional().nullable(),
});

export const assignTaskSchema = z.object({
  assignedToId: objectId.nullable(), // null = unassign
});
