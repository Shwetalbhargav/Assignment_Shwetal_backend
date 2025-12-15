import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Helpers
 */
function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getIp(req: Request) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) return xf.split(",")[0].trim();
  return req.socket.remoteAddress ?? undefined;
}

function getUserId(req: Request) {
  const id = (req as any).user?.id as string | undefined;
  if (!id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return id;
}

function toPublicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * =========================
 * REGISTER
 * =========================
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, mobileNumber } = req.body as {
      name: string;
      email: string;
      password: string;
      mobileNumber?: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobileNumber,
        passwordHash,
      },
    });

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * =========================
 * LOGIN (creates session)
 * =========================
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    // Create refresh secret (plain) and store only its hash in DB
    const refreshPlain = crypto.randomBytes(48).toString("hex");
    const refreshHash = sha256(refreshPlain);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshHash,
        expiresAt,
        userAgent: req.headers["user-agent"] ?? undefined,
        ip: getIp(req),
      },
    });

    const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    // Refresh token includes session id + random secret (plain)
    const refreshToken = jwt.sign(
      { sub: user.id, sid: session.id, tok: refreshPlain },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * =========================
 * REFRESH (rotate refresh)
 * =========================
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      sub: string;
      sid: string;
      tok: string;
    };

    const session = await prisma.session.findUnique({ where: { id: payload.sid } });

    if (!session) return res.status(401).json({ message: "Invalid refresh token" });
    if (session.revokedAt) return res.status(401).json({ message: "Session revoked" });
    if (session.expiresAt < new Date()) return res.status(401).json({ message: "Session expired" });

    // Validate refresh token secret
    const incomingHash = sha256(payload.tok);
    if (incomingHash !== session.refreshHash) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Rotate refresh secret
    const newPlain = crypto.randomBytes(48).toString("hex");
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshHash: sha256(newPlain),
        lastSeenAt: new Date(),
      },
    });

    const newAccessToken = jwt.sign({ sub: payload.sub }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign(
      { sub: payload.sub, sid: session.id, tok: newPlain },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

/**
 * =========================
 * LOGOUT (revoke current session)
 * =========================
 * Body: { refreshToken }
 */
export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sid: string };

    await prisma.session.update({
      where: { id: payload.sid },
      data: { revokedAt: new Date() },
    });

    return res.json({ message: "Logged out successfully" });
  } catch {
    // Don't leak details
    return res.json({ message: "Logged out successfully" });
  }
}

/**
 * =========================
 * LIST SESSIONS (session tracker)
 * =========================
 * Protected route (requireAuth)
 */
export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        lastSeenAt: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    return res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

/**
 * =========================
 * REVOKE A SESSION (by id)
 * =========================
 * Protected route (requireAuth)
 * POST /api/v1/auth/sessions/:id/revoke
 */
export async function revokeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const sessionId = req.params.id;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Session not found" });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
