"use client";

import { useAuth, type UserRole } from "@/shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/login" }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const allowed = !isLoading && !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!allowedRoles.includes(user.role)) { router.push(redirectTo); }
  }, [user, isLoading, router, redirectTo, allowedRoles]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
      }}>
        <div style={{
          width: "20px",
          height: "20px",
          border: "2px solid var(--color-border)",
          borderTopColor: "var(--color-accent)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
