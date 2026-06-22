import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";
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
      include: { user: { select: { email: true, displayName: true, firstName: true, lastName: true } } },
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

  const code    = randomBytes(32).toString("hex");
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

  let emailSent = true;
  try {
    await sendInviteEmail(email, inviteLink, firstName ?? "Admin");
  } catch (mailErr: any) {
    emailSent = false;
    console.error("❌ [inviteAdmin] email failed:", mailErr?.message);
  }

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "ADMIN_INVITED", meta: { email, emailSent } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: emailSent
      ? "Admin invited successfully"
      : "Admin created but email delivery failed — use Resend Invite to retry",
    data:    { id: admin.id, email: admin.email, emailSent },
  });
});

// ── Suspend admin ──────────────────────────────────────────────────────────────

export const suspendAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin  = await prisma.user.findUnique({ where: { id } });
  if (!admin) throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  if (admin.role !== "ADMIN") throw new AppError("User is not an admin", HttpStatus.BAD_REQUEST);
  if (admin.accountStatus === "SUSPENDED") throw new AppError("Admin is already suspended", HttpStatus.BAD_REQUEST);

  await prisma.user.update({ where: { id }, data: { accountStatus: "SUSPENDED" } });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.userId, action: "ADMIN_SUSPENDED",
      meta:   { email: admin.email, previousStatus: admin.accountStatus },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", message: "Admin suspended" });
});

// ── Activate admin ─────────────────────────────────────────────────────────────

export const activateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin  = await prisma.user.findUnique({ where: { id } });
  if (!admin) throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  if (admin.role !== "ADMIN") throw new AppError("User is not an admin", HttpStatus.BAD_REQUEST);

  await prisma.user.update({ where: { id }, data: { accountStatus: "ACTIVE" } });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.userId, action: "ADMIN_ACTIVATED",
      meta:   { email: admin.email, previousStatus: admin.accountStatus },
    },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", message: "Admin activated" });
});

// ── Resend admin invite ────────────────────────────────────────────────────────

export const resendAdminInvite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin  = await prisma.user.findUnique({ where: { id } });
  if (!admin) throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  if (admin.accountStatus !== "PENDING") throw new AppError("Admin is not in PENDING state", HttpStatus.BAD_REQUEST);

  const code    = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id },
    data:  { verificationCode: code, verificationExpires: expires },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(admin.email)}`;
  await sendInviteEmail(admin.email, inviteLink, admin.firstName ?? "Admin");

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "ADMIN_INVITE_RESENT", meta: { email: admin.email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", message: "Invite resent" });
});

// ── Remove admin (hard delete) ─────────────────────────────────────────────────

export const removeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const admin  = await prisma.user.findUnique({ where: { id } });
  if (!admin) throw new AppError("Admin not found", HttpStatus.NOT_FOUND);
  if (admin.role !== "ADMIN") throw new AppError("User is not an admin", HttpStatus.BAD_REQUEST);

  await prisma.auditLog.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "ADMIN_DELETED", meta: { email: admin.email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({ status: "success", message: "Admin deleted" });
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
