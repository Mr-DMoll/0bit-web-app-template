"use client";

import { useAuth } from "@/shared/context/AuthContext";
import Link from "next/link";

export default function ManagerDashboard() {
  const { user } = useAuth();

  const displayName =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Manager";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
          Good day, {displayName.split(" ")[0]}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
          Here's a summary of your projects
        </p>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {[
          { href: "/manager/projects", label: "My Projects",     icon: "📁", desc: "View and manage projects"  },
          { href: "/profile",          label: "Profile",          icon: "👤", desc: "Update your information"  },
          { href: "/settings",         label: "Settings",         icon: "⚙️", desc: "Manage your account"      },
        ].map(({ href, label, icon, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "20px",
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-card-border)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-card-border)")}
            >
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{icon}</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Projects placeholder */}
      <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>Recent Projects</h3>
          <Link href="/manager/projects" style={{ fontSize: "12px", color: "var(--color-accent)", textDecoration: "none" }}>View all →</Link>
        </div>
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>No projects assigned yet</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
            Your assigned projects will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
