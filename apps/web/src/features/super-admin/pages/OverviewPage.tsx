"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Clock, Activity, TrendingUp } from "lucide-react";
import apiClient from "@/api/client";

interface Stats {
  totalUsers:     number;
  totalAdmins:    number;
  pendingUsers:   number;
  recentActivity: any[];
}

function StatCard({
  label, value, icon: Icon, color, subtle, note,
}: {
  label: string; value: number; note?: string;
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
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {label}
        </div>
        {note && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
            <TrendingUp size={11} style={{ color: "var(--color-success)" } as any} />
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityFeed({ logs }: { logs: any[] }) {
  if (!logs.length) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div>
      {logs.map((log: any, i: number) => {
        const name    = log.user?.displayName ?? log.user?.email ?? "System";
        const time    = new Date(log.createdAt);
        const timeStr = time.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
        const dateStr = time.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
        const isToday = new Date().toDateString() === time.toDateString();

        return (
          <div
            key={log.id}
            style={{
              display:      "flex",
              alignItems:   "flex-start",
              gap:          "12px",
              padding:      "13px 24px",
              borderBottom: i < logs.length - 1 ? "1px solid var(--color-border)" : "none",
              transition:   "background var(--transition-fast)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--color-bg-subtle)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <div style={{
              width:          "28px",
              height:         "28px",
              borderRadius:   "50%",
              background:     "var(--color-accent-subtle)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       "11px",
              fontWeight:     700,
              color:          "var(--color-accent)",
              flexShrink:     0,
            }}>
              {(name[0] ?? "?").toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span style={{ color: "var(--color-text-muted)", marginLeft: "6px" }}>
                  {log.action.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                {isToday ? timeStr : `${dateStr} · ${timeStr}`}
              </div>
            </div>
          </div>
        );
      })}
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-text-muted)", fontSize: "14px" }}>
        <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Loading…
      </div>
    </div>
  );

  const activeUsers = (stats?.totalUsers ?? 0) - (stats?.pendingUsers ?? 0);

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="var(--color-accent)"
          subtle="var(--color-accent-subtle)"
          note={`${activeUsers} active`}
        />
        <StatCard
          label="Admins"
          value={stats?.totalAdmins ?? 0}
          icon={Shield}
          color="var(--color-success)"
          subtle="var(--color-success-subtle)"
        />
        <StatCard
          label="Pending Setup"
          value={stats?.pendingUsers ?? 0}
          icon={Clock}
          color="var(--color-warning)"
          subtle="var(--color-warning-subtle)"
          note="Awaiting activation"
        />
      </div>

      {/* Activity feed */}
      <div style={{
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--color-card-shadow)",
        overflow:     "hidden",
      }}>
        <div style={{
          padding:        "18px 24px",
          borderBottom:   "1px solid var(--color-border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={16} strokeWidth={1.8} style={{ color: "var(--color-text-muted)" } as any} />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Recent Activity
            </h2>
          </div>
          <a
            href="/super-admin/activity"
            style={{ fontSize: "12px", color: "var(--color-accent)", textDecoration: "none", fontWeight: 500 }}
          >
            View all →
          </a>
        </div>

        <ActivityFeed logs={stats?.recentActivity ?? []} />
      </div>
    </div>
  );
}
