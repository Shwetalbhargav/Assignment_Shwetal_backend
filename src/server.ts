import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initSocket } from "./modules/socket/socket.server";

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 API + Socket listening on http://localhost:${PORT}`);
});

