import { Request, Response } from "express";
import axios from "axios";
import https from "node:https";
import { prisma } from "@repo/database";
import { HttpStatus } from "@repo/types";
import { AppError }    from "../../utils/appError.js";
import { AuthService } from "./auth.service.js";
import env from "../../config/env.config.js";

// Force IPv4 — WSL2 Happy Eyeballs times out on IPv6 for Google APIs
const ipv4Agent = new https.Agent({ family: 4 });

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN:       "/admin",
  MANAGER:     "/manager",
  USER:        "/user",
};

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
    const tokenRes = await axios.post<{ access_token: string; refresh_token?: string }>(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        code,
        client_id:     env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  callbackUrl(),
        grant_type:    "authorization_code",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, httpsAgent: ipv4Agent },
    );
    const tokens = tokenRes.data;

    // Fetch Google user profile
    const profileRes = await axios.get<{
      id:             string;
      email:          string;
      given_name?:    string;
      family_name?:   string;
      picture?:       string;
      verified_email: boolean;
    }>(GOOGLE_USER_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      httpsAgent: ipv4Agent,
    });
    const profile = profileRes.data;

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
        // Brand-new user via Google — always allowed with USER role
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
    const rolePath = ROLE_ROUTES[user.role] ?? "/";

    res.redirect(
      `${env.FRONTEND_URL}/oauth/callback?token=${jwt}&to=${encodeURIComponent(rolePath)}`
    );
  } catch (err) {
    console.error("[Google OAuth] callback error:", err);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}
