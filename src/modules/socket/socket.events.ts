import { getIO } from "./socket.server";

export const SocketEvents = {
  TASK_UPDATED: "task:updated",
  TASK_ASSIGNED: "task:assigned",
  NOTIFICATION_NEW: "notification:new",
} as const;

export function emitTaskUpdated(task: any) {
  // simplest: broadcast to everyone
  getIO().emit(SocketEvents.TASK_UPDATED, task);
}

export function emitTaskAssigned(userId: string, payload: any) {
  // targeted: only assigned user
  getIO().to(`user:${userId}`).emit(SocketEvents.TASK_ASSIGNED, payload);
}

export function emitNotificationNew(userId: string, payload: any) {
  getIO().to(`user:${userId}`).emit(SocketEvents.NOTIFICATION_NEW, payload);
}

