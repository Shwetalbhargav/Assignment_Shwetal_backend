import { Request, Response, NextFunction } from "express";
import { NotificationsService } from "../services/notifications.service";

const notificationsService = new NotificationsService();

function requireString(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error(`${name} is required`), { status: 400 });
  }
  return value.trim();
}

function getCurrentUserId(req: Request): string {
  const anyReq = req as any;
  const fromUser = anyReq?.user?.id;
  if (typeof fromUser === "string" && fromUser.trim()) return fromUser.trim();

  const fromHeader = req.header("x-user-id");
  if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();

  throw Object.assign(new Error("Unauthorized"), { status: 401 });
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getCurrentUserId(req);
    const items = await notificationsService.listForUser(userId);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function unreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getCurrentUserId(req);
    const count = await notificationsService.unreadCount(userId);
    res.json({ count });
  } catch (e) {
    next(e);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getCurrentUserId(req);
    const notificationId = requireString(req.params.notificationId, "notificationId");
    const out = await notificationsService.markRead(userId, notificationId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getCurrentUserId(req);
    const out = await notificationsService.markAllRead(userId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function getMyNotifications(req, res) {
  const userId = req.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(notifications);
}

export async function markAsRead(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const notif = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

  if (notif.count === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({ success: true });
}

