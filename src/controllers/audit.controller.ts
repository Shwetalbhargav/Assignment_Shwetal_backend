import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

export async function getTaskAudit(req: Request, res: Response) {
  const { taskId } = req.params;

  const logs = await prisma.auditLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(logs);
}
