import { Request, Response } from "express";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { AppError }    from "../../utils/appError.js";
import { AuthService } from "./auth.service.js";
import { setAuthCookie } from "../../utils/cookie.util.js";
import env from "../../config/env.config.js";

const authService = new AuthService();

const GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v2/userinfo";

function callbackUrl() {
  return `${env.API_URL}/api/v1/auth/google/callback`;
}

// ── Step 1: redirect to Google ────────────────────────────────────────────────

export function googleRedirect(req: Request, res: Response) {
  if (!env.GOOGLE_CLIENT_ID) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      status: "fail", message: "Google OAuth is not configured",
    });
    return;
  }

  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  callbackUrl(),
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

// ── Step 2: handle callback ────────────────────────────────────────────────────

export async function googleCallback(req: Request, res: Response) {
  const { code, error } = req.query as Record<string, string>;

  if (error || !code) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  callbackUrl(),
        grant_type:    "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      throw new AppError("Failed to exchange Google code", HttpStatus.SERVICE_UNAVAILABLE);
    }

    const tokens = await tokenRes.json() as {
      access_token:  string;
      refresh_token?: string;
    };

    // Fetch Google user profile
    const profileRes = await fetch(GOOGLE_USER_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new AppError("Failed to fetch Google profile", HttpStatus.SERVICE_UNAVAILABLE);
    }

    const profile = await profileRes.json() as {
      id:             string;
      email:          string;
      given_name?:    string;
      family_name?:   string;
      picture?:       string;
      verified_email: boolean;
    };

    if (!profile.email) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=google_no_email`);
    }

    // Upsert user: find by googleId → find by email → create
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
      });

      if (user) {
        // Link existing account to Google
        user = await prisma.user.update({
          where: { id: user.id },
          data:  {
            googleId:           profile.id,
            googleRefreshToken: tokens.refresh_token ?? null,
            avatarUrl:          user.avatarUrl || profile.picture || null,
            accountStatus:      user.accountStatus === "PENDING" ? "ACTIVE" : user.accountStatus,
          },
        });
      } else {
        // Brand-new user via Google — only allowed if registration is open
        const setting = await prisma.systemSetting.findUnique({
          where: { key: "registration_mode" },
        });
        const mode = setting?.value ?? "INVITE_ONLY";

        if (mode === "INVITE_ONLY") {
          return res.redirect(`${env.FRONTEND_URL}/login?error=invite_only`);
        }

        user = await prisma.user.create({
          data: {
            email:              profile.email.toLowerCase(),
            password:           "",
            role:               "USER",
            accountStatus:      "ACTIVE",
            firstName:          profile.given_name  ?? null,
            lastName:           profile.family_name ?? null,
            googleId:           profile.id,
            googleRefreshToken: tokens.refresh_token ?? null,
            avatarUrl:          profile.picture ?? null,
          },
        });

        await prisma.auditLog.create({
          data: { userId: user.id, action: "REGISTERED_GOOGLE" },
        });
      }
    } else {
      // Refresh token if provided
      if (tokens.refresh_token) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { googleRefreshToken: tokens.refresh_token },
        });
      }
    }

    if (user.accountStatus === "SUSPENDED") {
      return res.redirect(`${env.FRONTEND_URL}/login?error=suspended`);
    }
    if (user.accountStatus === "DELETED") {
      return res.redirect(`${env.FRONTEND_URL}/login?error=not_found`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { lastActiveAt: new Date() },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN_GOOGLE", ip: req.ip ?? null },
    });

    const jwt = authService.generateToken(user.id, user.role);
    setAuthCookie(res, jwt);

    // Redirect to frontend oauth callback — frontend will read cookie and hydrate
    res.redirect(`${env.FRONTEND_URL}/oauth/callback`);
  } catch (err) {
    console.error("[Google OAuth] callback error:", err);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}
