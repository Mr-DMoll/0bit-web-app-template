"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Shield } from "lucide-react";
import apiClient from "@/api/client";

interface Stats {
  totalUsers:     number;
  totalAdmins:    number;
  pendingUsers:   number;
  recentActivity: any[];
}

export default function SuperAdminOverview() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/super-admin/stats")
      .then((r) => setStats(r.data?.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Users",   value: stats?.totalUsers   ?? 0, icon: <Users size={20} />,     color: "#6366f1" },
    { label: "Admins",        value: stats?.totalAdmins  ?? 0, icon: <Shield size={20} />,    color: "#84cc16" },
    { label: "Pending",       value: stats?.pendingUsers ?? 0, icon: <Clock size={20} />,     color: "#f59e0b" },
  ];

  if (loading) return (
    <div style={{ padding: "40px", color: "var(--color-text-muted)", textAlign: "center" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: "1200px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "8px" }}>
        Platform Overview
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "32px" }}>
        Super Admin Dashboard
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-card-border)",
            borderRadius: "12px", padding: "24px",
          }}>
            <div style={{ color: card.color, marginBottom: "12px" }}>{card.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "4px" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "12px", padding: "24px",
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "16px" }}>
          Recent Activity
        </h2>
        {stats?.recentActivity.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No activity yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stats?.recentActivity.map((log: any) => (
              <div key={log.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: "8px",
                background: "var(--color-bg-subtle)",
                fontSize: "13px",
              }}>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {log.user?.displayName ?? log.user?.email} — {log.action}
                </span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
