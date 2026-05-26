"use client";

import { useAuth } from "@/shared/context/AuthContext";
import Link from "next/link";

export default function UserDashboard() {
  const { user } = useAuth();

  const displayName =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "there";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
          Welcome, {displayName.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Your project dashboard
        </p>
      </div>

      {/* Project card */}
      <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>Your Project</h3>
        </div>
        <div style={{ padding: "48px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
            No active project
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
            Your project details will appear here once an admin sets up your workspace
          </p>
          <Link href="/profile" style={{
            display: "inline-block",
            padding: "9px 18px",
            background: "var(--color-accent)",
            borderRadius: "8px",
            fontSize: "13px", fontWeight: 700,
            color: "var(--color-accent-text)",
            textDecoration: "none",
          }}>
            Complete your profile →
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        {[
          { href: "/profile",  label: "Profile",  icon: "👤", desc: "Your account details" },
          { href: "/settings", label: "Settings", icon: "⚙️", desc: "Preferences & password" },
        ].map(({ href, label, icon, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "18px 20px",
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-card-border)",
              borderRadius: "10px",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-card-border)")}
            >
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{icon}</div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 3px" }}>{label}</p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
