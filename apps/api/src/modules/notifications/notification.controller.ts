import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";

// ── List own notifications ─────────────────────────────────────────────────────

export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where:   { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take:    50,
    }),
    prisma.notification.count({
      where: { userId: req.user!.userId, read: false },
    }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { notifications, unreadCount },
  });
});

// ── Mark one as read ───────────────────────────────────────────────────────────

export const markRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification)
    throw new AppError("Notification not found", HttpStatus.NOT_FOUND);
  if (notification.userId !== req.user!.userId)
    throw new AppError("Not authorised", HttpStatus.FORBIDDEN);

  await prisma.notification.update({ where: { id }, data: { read: true } });

  return res.status(HttpStatus.OK).json({ status: "success" });
});

// ── Mark all as read ───────────────────────────────────────────────────────────

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, read: false },
    data:  { read: true },
  });

  return res.status(HttpStatus.OK).json({ status: "success" });
});

// ── Delete one ─────────────────────────────────────────────────────────────────

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification)
    throw new AppError("Notification not found", HttpStatus.NOT_FOUND);
  if (notification.userId !== req.user!.userId)
    throw new AppError("Not authorised", HttpStatus.FORBIDDEN);

  await prisma.notification.delete({ where: { id } });

  return res.status(HttpStatus.OK).json({ status: "success" });
});
