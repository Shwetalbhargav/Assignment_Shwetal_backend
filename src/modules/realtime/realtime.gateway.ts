import type { Server, Socket } from "socket.io";
import { REALTIME_EVENTS, userRoom } from "./realtime.events";

type AuthPayload = { userId: string };
type RoomPayload = { room: string };

export const registerRealtimeGateway = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // Client can send { userId } once after connect
    socket.on(REALTIME_EVENTS.AUTH, (payload: AuthPayload) => {
      if (!payload?.userId) return;
      socket.join(userRoom(payload.userId));
    });

    socket.on(REALTIME_EVENTS.JOIN, (payload: RoomPayload) => {
      if (!payload?.room) return;
      socket.join(payload.room);
    });

    socket.on(REALTIME_EVENTS.LEAVE, (payload: RoomPayload) => {
      if (!payload?.room) return;
      socket.leave(payload.room);
    });
  });

  return io;
};

export const emitToUser = (io: Server, userId: string, event: string, data: unknown) => {
  io.to(userRoom(userId)).emit(event, data);
};
