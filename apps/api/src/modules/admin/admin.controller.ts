import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus, Role } from "@repo/types";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";
import { sendInviteEmail } from "../../services/mail.service.js";

// ── Admin dashboard ────────────────────────────────────────────────────────────

export const adminDashboard = catchAsync(async (_req: Request, res: Response) => {
  const [totalUsers, totalManagers, pendingUsers, activeUsers, recentSignups, recentActivity] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER",    accountStatus: { not: "DELETED" } } }),
      prisma.user.count({ where: { role: "MANAGER", accountStatus: { not: "DELETED" } } }),
      prisma.user.count({ where: { role: "USER",    accountStatus: "PENDING" } }),
      prisma.user.count({ where: { role: "USER",    accountStatus: "ACTIVE"  } }),
      prisma.user.findMany({
        where:   { role: "USER" },
        orderBy: { createdAt: "desc" },
        take:    5,
        select:  { id: true, email: true, displayName: true, firstName: true, lastName: true,
                   accountStatus: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        where:   { user: { role: { in: ["USER", "MANAGER"] } } },
        orderBy: { createdAt: "desc" },
        take:    8,
        include: { user: { select: { email: true, displayName: true, firstName: true, lastName: true } } },
      }),
    ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { totalUsers, totalManagers, pendingUsers, activeUsers, recentSignups, recentActivity },
  });
});

// ── List users (supports ?role=USER|MANAGER, ?status=, ?page=) ────────────────

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = 50;
  const skip   = (page - 1) * limit;
  const roleQ  = (req.query.role as string)?.toUpperCase();
  const status = req.query.status as string | undefined;

  const validRoles = ["USER", "MANAGER"];
  if (roleQ && !validRoles.includes(roleQ))
    throw new AppError("Invalid role filter", HttpStatus.BAD_REQUEST);

  const where: any = {
    role:          roleQ ? { equals: roleQ } : { in: ["USER", "MANAGER"] },
    accountStatus: status ? { equals: status } : { not: "DELETED" },
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, role: true,
        firstName: true, lastName: true, displayName: true,
        accountStatus: true, createdAt: true, lastActiveAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { users, pagination: { total, page, pages: Math.ceil(total / limit) } },
  });
});

// ── Activity log (paginated audit for admin) ───────────────────────────────────

export const adminActivity = catchAsync(async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit  = 30;
  const action = req.query.action as string | undefined;
  const role   = req.query.role   as string | undefined;
  const from   = req.query.from   as string | undefined;
  const to     = req.query.to     as string | undefined;

  const allowedRoles = ["USER", "MANAGER", "ADMIN", "SUPER_ADMIN"];
  const roleFilter   = role && allowedRoles.includes(role.toUpperCase())
    ? [role.toUpperCase()]
    : allowedRoles;

  const where: any = { user: { role: { in: roleFilter } } };
  if (action) where.action = { contains: action.toUpperCase() };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        user: { select: { email: true, displayName: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return res.status(HttpStatus.OK).json({
    status: "success",
    data:   { logs, pagination: { total, page, pages: Math.ceil(total / limit) } },
  });
});

// ── Invite user (role: USER) ───────────────────────────────────────────────────

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", HttpStatus.CONFLICT);

  const code    = randomBytes(32).toString("hex");
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
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: "User invited successfully",
    data:    { id: user.id, email: user.email },
  });
});

// ── Invite manager (role: MANAGER) ────────────────────────────────────────────

export const inviteManager = catchAsync(async (req: Request, res: Response) => {
  const { email, firstName, lastName } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", HttpStatus.CONFLICT);

  const code    = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const manager = await prisma.user.create({
    data: {
      email,
      password:            "",
      role:                "MANAGER",
      accountStatus:       "PENDING",
      firstName:           firstName ?? null,
      lastName:            lastName  ?? null,
      invitedById:         req.user!.userId,
      verificationCode:    code,
      verificationExpires: expires,
    },
  });

  const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${code}&email=${encodeURIComponent(email)}`;
  await sendInviteEmail(email, inviteLink, firstName ?? "Manager");

  await prisma.auditLog.create({
    data: { userId: req.user!.userId, action: "MANAGER_INVITED", meta: { email } },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: "Manager invited successfully",
    data:    { id: manager.id, email: manager.email },
  });
});

// ── List managers ──────────────────────────────────────────────────────────────

export const listManagers = catchAsync(async (_req: Request, res: Response) => {
  const managers = await prisma.user.findMany({
    where:   { role: "MANAGER", accountStatus: { not: "DELETED" } },
    select:  {
      id: true, email: true, firstName: true, lastName: true,
      displayName: true, accountStatus: true, createdAt: true, lastActiveAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(HttpStatus.OK).json({ status: "success", data: { managers } });
});

// ── Update user status ─────────────────────────────────────────────────────────

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id }     = req.params;
  const { status } = req.body;

  const valid = ["ACTIVE", "SUSPENDED", "DELETED"];
  if (!valid.includes(status))
    throw new AppError("Invalid status value", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

  await prisma.user.update({ where: { id }, data: { accountStatus: status } });

  return res.status(HttpStatus.OK).json({ status: "success", message: "User status updated" });
});

// ── Update user role ───────────────────────────────────────────────────────────

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id }   = req.params;
  const { role } = req.body;

  const allowedRoles = [Role.USER, Role.MANAGER];
  if (!allowedRoles.includes(role))
    throw new AppError("Admins can only assign USER or MANAGER roles", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);

  await prisma.user.update({ where: { id }, data: { role } });

  return res.status(HttpStatus.OK).json({ status: "success", message: "User role updated" });
});
