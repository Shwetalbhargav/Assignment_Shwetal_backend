import type { Server } from "socket.io";

/**
 * We keep a single Socket.io server reference here so services can emit events
 * without importing app/server setup code.
 */
let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
}

function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io server not initialized. Call setSocketServer(io) during bootstrap.");
  }
  return io;
}

/** Recommended: rooms are user-specific so you can target a user reliably. */
export const userRoom = (userId: string) => `user:${userId}`;

// ---- Events (keep names consistent with your FE listener constants) ----
export const SOCKET_EVENTS = {
  TASK_UPDATED: "taskUpdated",
  TASK_ASSIGNED: "taskAssigned",
  NOTIFICATION: "notificationCreated",
} as const;

export function emitTaskUpdated(task: any) {
  getIO().emit(SOCKET_EVENTS.TASK_UPDATED, task);
}

export function emitTaskAssigned(userId: string, payload: any) {
  getIO().to(userRoom(userId)).emit(SOCKET_EVENTS.TASK_ASSIGNED, payload);
}

/** ✅ This is the missing one */
export function emitNotification(userId: string, notification: any) {
  getIO().to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION, notification);
}
