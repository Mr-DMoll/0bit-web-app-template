import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";
import { sendInviteEmail } from "../../services/mail.service.js";

// ── Admin dashboard ────────────────────────────────────────────────────────────

export const adminDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [totalUsers, pendingUsers, activeUsers, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: "USER", accountStatus: { not: "DELETED" } } }),
    prisma.user.count({ where: { role: "USER", accountStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "USER", accountStatus: "ACTIVE" } }),
    prisma.user.findMany({
      where:   { role: "USER" },
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { id: true, email: true, displayName: true, accountStatus: true, createdAt: true },
    }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { totalUsers, pendingUsers, activeUsers, recentUsers },
  });
});

// ── List users ─────────────────────────────────────────────────────────────────

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where:   { role: "USER", accountStatus: { not: "DELETED" } },
      select:  {
        id: true, email: true, firstName: true, lastName: true,
        displayName: true, accountStatus: true, createdAt: true, lastActiveAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take:    limit,
    }),
    prisma.user.count({ where: { role: "USER", accountStatus: { not: "DELETED" } } }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { users, pagination: { total, page, pages: Math.ceil(total / limit) } },
  });
});

// ── Invite user ────────────────────────────────────────────────────────────────

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", HttpStatus.CONFLICT);

  const code    = Math.random().toString(36).slice(2, 10).toUpperCase();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      password:            "",
      role:                "USER",
      accountStatus:       "PENDING",
      firstName:           firstName ?? null,
      lastName:            lastName  ?? null,
      invitedById:         req.user!.userId,
      verificationCode:    code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "User");

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "USER_INVITED", meta: { email } },
  });

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: "User invited successfully",
    data:    { id: user.id, email: user.email },
  });
});

// ── Update user status ─────────────────────────────────────────────────────────

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id }     = req.params;
  const { status } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

  await prisma.user.update({ where: { id }, data: { accountStatus: status } });

  return res.status(HttpStatus.OK).json({ status: "success", message: "User updated" });
});
