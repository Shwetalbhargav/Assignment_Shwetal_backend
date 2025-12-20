export const REALTIME_EVENTS = {
  // client -> server
  AUTH: "auth", // payload: { userId: string }
  JOIN: "join", // payload: { room: string }
  LEAVE: "leave", // payload: { room: string }

  // server -> clients
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASK_ASSIGNED: "task:assigned",
  NOTIFICATION_CREATED: "notification:created",
} as const;

export type RealtimeEvent = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];

export const userRoom = (userId: string) => `user:${userId}`;
