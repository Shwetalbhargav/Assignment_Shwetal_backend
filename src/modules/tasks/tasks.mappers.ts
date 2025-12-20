import type { TaskPriority, TaskStatus } from "@prisma/client";

export const toPrismaStatus = (s: string): TaskStatus => {
  switch (s) {
    case "To Do":
      return "TODO";
    case "In Progress":
      return "IN_PROGRESS";
    case "Review":
      return "REVIEW";
    case "Completed":
      return "COMPLETED";
    default:
      // if you already send Prisma enums from frontend, allow them too
      return s as TaskStatus;
  }
};

export const toPrismaPriority = (p: string): TaskPriority => {
  switch (p) {
    case "Low":
      return "LOW";
    case "Medium":
      return "MEDIUM";
    case "High":
      return "HIGH";
    case "Urgent":
      return "URGENT";
    default:
      return p as TaskPriority;
  }
};

export const fromPrismaStatus = (s: TaskStatus): string => {
  switch (s) {
    case "TODO":
      return "To Do";
    case "IN_PROGRESS":
      return "In Progress";
    case "REVIEW":
      return "Review";
    case "COMPLETED":
      return "Completed";
    default:
      return s;
  }
};

export const fromPrismaPriority = (p: TaskPriority): string => {
  switch (p) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
    case "URGENT":
      return "Urgent";
    default:
      return p;
  }
};
