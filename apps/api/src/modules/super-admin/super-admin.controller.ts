import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";
import { AuthService } from "../auth/auth.service.js";
const authService = new AuthService();
import { sendInviteEmail } from "../../services/mail.service.js";

// ── Platform stats ─────────────────────────────────────────────────────────────

export const platformStats = catchAsync(async (_req: Request, res: Response) => {
  const [totalUsers, totalAdmins, pendingUsers, recentActivity] = await Promise.all([
    prisma.user.count({ where: { accountStatus: { not: "DELETED" } } }),
    prisma.user.count({ where: { role: "ADMIN", accountStatus: { not: "DELETED" } } }),
    prisma.user.count({ where: { accountStatus: "PENDING" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take:    10,
      include: { user: { select: { email: true, displayName: true } } },
    }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { totalUsers, totalAdmins, pendingUsers, recentActivity },
  });
});

// ── List admins ────────────────────────────────────────────────────────────────

export const listAdmins = catchAsync(async (_req: Request, res: Response) => {
  const admins = await prisma.user.findMany({
    where:   { role: "ADMIN" },
    select:  {
      id: true, email: true, firstName: true, lastName: true,
      displayName: true, accountStatus: true, createdAt: true, lastActiveAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { admins } });
});

// ── Invite admin ───────────────────────────────────────────────────────────────

export const inviteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User with this email already exists", HttpStatus.CONFLICT);

  const code    = Math.random().toString(36).slice(2, 10).toUpperCase();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const admin = await prisma.user.create({
    data: {
      email,
      password:            "",
      role:                "ADMIN",
      accountStatus:       "PENDING",
      firstName:           firstName ?? null,
      lastName:            lastName  ?? null,
      invitedById:         req.user!.userId,
      verificationCode:    code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "Admin");

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "ADMIN_INVITED", meta: { email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: "Admin invited successfully",
    data:    { id: admin.id, email: admin.email },
  });
});

// ── Remove admin ───────────────────────────────────────────────────────────────

export const removeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin  = await prisma.user.findUnique({ where: { id } });
  if (!admin) throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  if (admin.role !== "ADMIN") throw new AppError("User is not an admin", HttpStatus.BAD_REQUEST);

  await prisma.user.update({
    where: { id },
    data:  { accountStatus: "DELETED" },
  });

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "ADMIN_REMOVED", meta: { email: admin.email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", message: "Admin removed" });
});

// ── Full audit log ─────────────────────────────────────────────────────────────

export const auditLog = catchAsync(async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page as string || "1", 10));
  const limit = 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        user: { select: { email: true, displayName: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.auditLog.count(),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { logs, total, page, pages: Math.ceil(total / limit) },
  });
});

// ── System settings ────────────────────────────────────────────────────────────

export const getSettings = catchAsync(async (_req: Request, res: Response) => {
  const settings = await prisma.systemSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return res.status(HttpStatus.OK).json({ status: "success", data: { settings: map } });
});

export const updateSetting = catchAsync(async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key || value === undefined) throw new AppError("Key and value required", HttpStatus.BAD_REQUEST);

  const setting = await prisma.systemSetting.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { setting } });
});
