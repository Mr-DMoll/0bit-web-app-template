"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN:       "/admin",
  MANAGER:     "/manager",
  USER:        "/user",
};

export default function OAuthCallbackPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(ROLE_ROUTES[user.role] ?? "/");
      } else {
        router.replace("/login?error=oauth_failed");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div style={{
      minHeight: "calc(100vh - 57px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {/* Spinner */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.08)",
          borderTopColor: "var(--color-accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}
