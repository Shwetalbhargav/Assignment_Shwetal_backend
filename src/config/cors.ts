import cors from "cors";
import { env } from "./env";

export const corsConfig = cors({
  origin: (origin, callback) => {
    // allow non-browser tools (Postman, curl)
    if (!origin) return callback(null, true);

    if (origin === env.CLIENT_URL) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
