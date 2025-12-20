import http from "http";
import { createApp } from "./app";
import { initSocket } from "./lib/socket";
import dotenv from "dotenv";
dotenv.config();
const app = createApp();
const server = http.createServer(app);

// ---------- Socket.io ----------
initSocket(server);

// ---------- Start ----------
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
