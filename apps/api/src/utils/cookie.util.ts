import { Response, CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

// ✅ token cookie — httpOnly: TRUE for security (JS cannot read it)
const tokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ✅ user_role cookie — httpOnly: FALSE so Next.js middleware can read it
export const roleCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, tokenCookieOptions);
};

export const setRoleCookie = (res: Response, role: string) => {
  res.cookie("user_role", role, roleCookieOptions);
};

export const clearAuthCookie = (res: Response) => {
  res.cookie("token", "", {
    ...tokenCookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
  // Also clear the role cookie
  res.cookie("user_role", "", {
    ...roleCookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
};