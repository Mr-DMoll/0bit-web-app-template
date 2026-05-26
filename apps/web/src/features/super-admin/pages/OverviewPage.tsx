"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Clock, Activity } from "lucide-react";
import apiClient from "@/api/client";

interface Stats {
  totalUsers:     number;
  totalAdmins:    number;
  pendingUsers:   number;
  recentActivity: any[];
}

function StatCard({
  label, value, icon: Icon, color, subtle,
}: {
  label: string; value: number;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string; subtle: string;
}) {
  return (
    <div style={{
      background:   "var(--color-card-bg)",
      border:       "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-xl)",
      boxShadow:    "var(--color-card-shadow)",
      padding:      "24px",
      display:      "flex",
      alignItems:   "flex-start",
      gap:          "16px",
    }}>
      <div style={{
        width:          "44px",
        height:         "44px",
        borderRadius:   "var(--radius-lg)",
        background:     subtle,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        color,
      }}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminOverview() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/super-admin/stats")
      .then((r) => setStats(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--color-text-muted)", fontSize: "14px" }}>
      Loading…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          Platform Overview
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Super Admin Dashboard
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <StatCard label="Total Users"   value={stats?.totalUsers   ?? 0} icon={Users}    color="var(--color-accent)"  subtle="var(--color-accent-subtle)"  />
        <StatCard label="Admins"        value={stats?.totalAdmins  ?? 0} icon={Shield}   color="var(--color-success)" subtle="var(--color-success-subtle)" />
        <StatCard label="Pending Setup" value={stats?.pendingUsers ?? 0} icon={Clock}    color="var(--color-warning)" subtle="var(--color-warning-subtle)" />
      </div>

      {/* Recent activity */}
      <div style={{
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--color-card-shadow)",
        overflow:     "hidden",
      }}>
        <div style={{
          padding:      "18px 24px",
          borderBottom: "1px solid var(--color-border)",
          display:      "flex",
          alignItems:   "center",
          gap:          "10px",
        }}>
          <Activity size={16} strokeWidth={1.8} style={{ color: "var(--color-text-muted)" } as any} />
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            Recent Activity
          </h2>
        </div>

        {!stats?.recentActivity?.length ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
            No activity recorded yet.
          </div>
        ) : (
          <div>
            {stats.recentActivity.map((log: any, i: number) => (
              <div key={log.id} style={{
                display:       "flex",
                justifyContent: "space-between",
                alignItems:    "center",
                padding:       "14px 24px",
                borderBottom:  i < stats.recentActivity.length - 1 ? "1px solid var(--color-border)" : "none",
                transition:    "background var(--transition-fast)",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-bg-subtle)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div>
                  <span style={{ fontSize: "13.5px", color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {log.user?.displayName ?? log.user?.email ?? "System"}
                  </span>
                  <span style={{ fontSize: "13.5px", color: "var(--color-text-muted)", marginLeft: "8px" }}>
                    {log.action}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
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
