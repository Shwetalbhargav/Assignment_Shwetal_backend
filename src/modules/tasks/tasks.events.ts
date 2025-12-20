export const TASK_EVENTS = {
  CREATED: "task:created",
  UPDATED: "task:updated",
  DELETED: "task:deleted",
  ASSIGNED: "task:assigned",
} as const;

export type TaskEvent = typeof TASK_EVENTS[keyof typeof TASK_EVENTS];
