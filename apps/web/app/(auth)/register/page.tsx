"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { Suspense } from "react";

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN:       "/admin",
  MANAGER:     "/manager",
  USER:        "/user",
};

const OAUTH_ERRORS: Record<string, string> = {
  invite_only:  "Registration is by invitation only. Please contact an admin.",
  oauth_failed: "Google sign-up failed. Please try again.",
};

function RegisterContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const errorKey = searchParams.get("error") ?? "";
  const errorMsg = OAUTH_ERRORS[errorKey] ?? "";

  useEffect(() => {
    if (!isLoading && user) {
      router.push(ROLE_ROUTES[user.role] ?? "/");
    }
  }, [user, isLoading, router]);

  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px", fontWeight: 900, color: "#0f172a",
          }}>O</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            Create an account
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Sign up with your Google account to get started
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px", padding: "32px",
          display: "flex", flexDirection: "column", gap: "20px",
        }}>
          {errorMsg && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", fontSize: "13px", color: "#f87171",
            }}>
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignUp}
            style={{
              width: "100%", padding: "13px 16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px", fontSize: "14px", fontWeight: 600,
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{
            padding: "14px 16px",
            background: "rgba(132,204,22,0.05)",
            border: "1px solid rgba(132,204,22,0.15)",
            borderRadius: "8px",
          }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>Received an invite?</strong>
              {" "}Check your email for an activation link instead of signing up here.
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
