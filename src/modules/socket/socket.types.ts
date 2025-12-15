import type { Socket } from "socket.io";

export type SocketUser = { id: string; email?: string };

export type AuthedSocket = Socket & {
  user?: SocketUser;
};
