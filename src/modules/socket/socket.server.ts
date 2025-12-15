import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { AuthedSocket } from "./socket.types";
import { addUserSocket, removeUserSocket } from "./socket.store";

let io: Server | null = null;

function getTokenFromHandshake(socket: AuthedSocket) {
  // 1) Authorization: Bearer <token>
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  // 2) Cookie: accessToken=<token> (adjust cookie name to your project)
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) return null;
  const parsed = cookie.parse(rawCookie);
  return parsed.accessToken ?? null;
}

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true, // lock this down later (frontend URL)
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket: AuthedSocket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) return next(new Error("Unauthorized"));

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      socket.user = { id: payload.sub || payload.userId, email: payload.email };

      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const userId = socket.user!.id;

    // personal room
    socket.join(`user:${userId}`);
    addUserSocket(userId, socket.id);

    socket.on("disconnect", () => {
      removeUserSocket(userId, socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
