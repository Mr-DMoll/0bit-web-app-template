import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus, Role } from "@repo/types";
import { AuthService } from "./auth.service.js";
import { setAuthCookie, setRoleCookie, clearAuthCookie } from "../../utils/cookie.util.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError }   from "../../utils/appError.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendInviteEmail } from "../../services/mail.service.js";

const authService = new AuthService();

// ── Login ──────────────────────────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password are required", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);

  if (user.accountStatus === "DELETED")
    throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);
  if (user.accountStatus === "SUSPENDED")
    throw new AppError("Your account has been suspended", HttpStatus.FORBIDDEN);
  if (user.accountStatus === "PENDING")
    throw new AppError("Your account is pending approval", HttpStatus.FORBIDDEN);
  if (!user.password)
    throw new AppError("Please use your invitation link to set a password first", HttpStatus.UNAUTHORIZED);

  const match = await authService.verifyPassword(password, user.password);
  if (!match) throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);

  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });

  const token = authService.generateToken(user.id, user.role);
  setAuthCookie(res, token);
  setRoleCookie(res, user.role);

  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", ip: req.ip ?? null },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({
    status: "success",
    data: {
      token,
      user: {
        id:          user.id,
        email:       user.email,
        role:        user.role,
        firstName:   user.firstName,
        lastName:    user.lastName,
        displayName: user.displayName,
        avatarUrl:   user.avatarUrl,
        accountStatus: user.accountStatus,
      },
    },
  });
});

// ── Get me ─────────────────────────────────────────────────────────────────────

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.user!.userId },
    select: {
      id: true, email: true, role: true, accountStatus: true,
      firstName: true, lastName: true, displayName: true,
      avatarUrl: true, phone: true,
      // city, country, language, dateOfBirth added after migration
      lastActiveAt: true, createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", HttpStatus.NOT_FOUND);
  return res.status(HttpStatus.OK).json({ status: "success", data: { user } });
});

// ── Logout ─────────────────────────────────────────────────────────────────────

export const logout = catchAsync(async (req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(HttpStatus.OK).json({ status: "success", message: "Logged out" });
});

// ── Set password (from invite link) ───────────────────────────────────────────

export const setPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password)
    throw new AppError("Token, email and password are required", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findFirst({
    where: {
      email:               email.trim().toLowerCase(),
      verificationCode:    token,
      verificationExpires: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Invalid or expired invitation link", HttpStatus.BAD_REQUEST);

  const hashed = await authService.hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:            hashed,
      accountStatus:       "ACTIVE",
      verificationCode:    null,
      verificationExpires: null,
    },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "PASSWORD_SET" },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({
    status:  "success",
    message: "Password set successfully. You can now log in.",
  });
});

// ── Forgot password ────────────────────────────────────────────────────────────

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(HttpStatus.OK).json({
      status:  "success",
      message: "If that email exists, a reset link has been sent.",
    });
  }

  const token   = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordResetToken: token, passwordResetExpires: expires },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await sendPasswordResetEmail(email, resetLink);

  return res.status(HttpStatus.OK).json({
    status:  "success",
    message: "If that email exists, a reset link has been sent.",
  });
});

// ── Reset password ─────────────────────────────────────────────────────────────

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password)
    throw new AppError("Token, email and password are required", HttpStatus.BAD_REQUEST);

  const user = await prisma.user.findFirst({
    where: {
      email:                email.trim().toLowerCase(),
      passwordResetToken:   token,
      passwordResetExpires: { gt: new Date() },
    },
  });

  if (!user) throw new AppError("Invalid or expired reset link", HttpStatus.BAD_REQUEST);

  const hashed = await authService.hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:             hashed,
      passwordResetToken:   null,
      passwordResetExpires: null,
    },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "PASSWORD_RESET", ip: req.ip ?? null },
  });
  req.auditLogged = true;

  return res.status(HttpStatus.OK).json({
    status:  "success",
    message: "Password reset successfully. You can now log in.",
  });
});

// ── Self register (only if registration mode allows) ──────────────────────────

export const register = catchAsync(async (req: Request, res: Response) => {
  // Check if self-registration is enabled
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "registration_mode" },
  });

  const mode = setting?.value ?? "INVITE_ONLY";
  if (mode === "INVITE_ONLY")
    throw new AppError("Registration is by invitation only", HttpStatus.FORBIDDEN);

  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) throw new AppError("Email and password are required", HttpStatus.BAD_REQUEST);

  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) throw new AppError("Email already in use", HttpStatus.CONFLICT);

  const hashed = await authService.hashPassword(password);
  const status  = mode === "SELF_REGISTER_AUTO" ? "ACTIVE" : "PENDING";

  const user = await prisma.user.create({
    data: {
      email:         email.trim().toLowerCase(),
      password:      hashed,
      role:          "USER",
      accountStatus: status,
      firstName:     firstName ?? null,
      lastName:      lastName  ?? null,
    },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "REGISTERED" },
  });
  req.auditLogged = true;

  if (mode === "SELF_REGISTER_AUTO") {
    const token = authService.generateToken(user.id, user.role);
    setAuthCookie(res, token);
    return res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { token, user: { id: user.id, email: user.email, role: user.role } },
    });
  }

  return res.status(HttpStatus.CREATED).json({
    status:  "success",
    message: "Registration successful. An admin will review your account.",
  });
});