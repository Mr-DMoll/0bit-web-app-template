"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/client";

function displayName(u: any) {
  return u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000); const hours = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now"; if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`; if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function formatAction(action: string, meta: any): string {
  const map: Record<string, (m: any) => string> = {
    PROJECT_CREATED:        (m) => `Created project "${m?.projectName ?? ""}"`,
    PROJECT_STATUS_CHANGED: (m) => `Changed status → ${m?.to ?? ""}`,
    MILESTONE_APPROVED:     ()  => `Approved a milestone`,
    DOCUMENT_CREATED:       (m) => `Created document "${m?.title ?? ""}"`,
    INVOICE_STATUS_UPDATED: (m) => `Invoice → ${m?.newStatus ?? ""}`,
    INTAKE_CONVERTED:       ()  => `Converted intake to project`,
  };
  const fn = map[action];
  return fn ? fn(meta) : action.replace(/_/g, " ").toLowerCase();
}

const STATUS_COLOR: Record<string, string> = {
  INTAKE: "#94a3b8", SCOPE_DRAFT: "#f59e0b", SCOPE_REVIEW: "#f59e0b",
  IN_DESIGN: "#3b82f6", DESIGN_REVIEW: "#3b82f6", CONTRACT_DRAFT: "#a855f7",
  CONTRACT_REVIEW: "#a855f7", ACTIVE: "var(--color-accent)", ON_HOLD: "#f59e0b",
  COMPLETE: "#22c55e", ARCHIVED: "#94a3b8",
};
const STATUS_LABEL: Record<string, string> = {
  INTAKE: "Intake", SCOPE_DRAFT: "Scope Draft", SCOPE_REVIEW: "Scope Review",
  IN_DESIGN: "In Design", DESIGN_REVIEW: "Design Review", CONTRACT_DRAFT: "Contract Draft",
  CONTRACT_REVIEW: "Contract Review", ACTIVE: "Active", ON_HOLD: "On Hold",
  COMPLETE: "Complete", ARCHIVED: "Archived",
};

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--color-card-shadow)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

export function AdminOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/admin/dashboard").then((r) => setData(r.data.data)).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px", color: "var(--color-text-muted)" }}>
      <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: "13px" }}>Loading dashboard...</span>
    </div>
  );

  const s = data?.stats;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Overview</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>Agency performance at a glance</p>
      </div>

      {/* Outstanding alert */}
      {(s?.outstandingCount ?? 0) > 0 && (
        <div style={{ padding: "12px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b" }}>
            💳 {s.outstandingCount} outstanding invoice{s.outstandingCount > 1 ? "s" : ""} — ZAR {s.outstandingAmount.toLocaleString()} unpaid
          </p>
          <button onClick={() => router.push("/admin/invoices")} style={{ padding: "5px 14px", fontSize: "12px", fontWeight: 600, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "#f59e0b" }}>
            View invoices
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
        {[
          { label: "Total Projects", value: s?.totalProjects ?? 0,  sub: `${s?.activeProjects ?? 0} active`,   color: "var(--color-accent)",                      big: true  },
          { label: "Staff",          value: s?.totalStaff    ?? 0,  sub: "Managers & developers",              color: "var(--color-text-primary)",      big: true  },
          { label: "Clients",        value: s?.totalClients  ?? 0,  sub: "Active accounts",                    color: "#3b82f6",                      big: true  },
          { label: "Total Revenue",  value: `ZAR ${(s?.totalRevenue ?? 0).toLocaleString()}`, sub: "From paid invoices", color: "#22c55e", big: false },
        ].map(({ label, value, sub, color, big }) => (
          <div key={label} style={{ padding: "16px 20px", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--color-card-shadow)" }}>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{label}</p>
            <p style={{ fontSize: big ? "30px" : "16px", fontWeight: big ? 300 : 700, color, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Pending milestones */}
      {(data?.pendingMilestones?.length ?? 0) > 0 && (
        <div style={{ padding: "14px 18px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b" }}>⏳ {data.pendingMilestones.length} milestone{data.pendingMilestones.length > 1 ? "s" : ""} awaiting approval</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.pendingMilestones.map((m: any) => (
              <div key={m.id} onClick={() => router.push(`/admin/projects/${m.project.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{m.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{m.project.name}</p>
                </div>
                {m.agreedAmount && <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-accent)" }}>ZAR {parseFloat(m.agreedAmount).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
        <Card title="Recent Projects" action={<button onClick={() => router.push("/admin/projects")} style={{ fontSize: "12px", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer" }}>View all →</button>}>
          {(data?.recentProjects?.length ?? 0) === 0
            ? <p style={{ fontSize: "13px", color: "var(--color-text-muted)", textAlign: "center", padding: "20px 0" }}>No projects yet</p>
            : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data.recentProjects.map((p: any, i: number) => {
                  const color = STATUS_COLOR[p.status] ?? "#94a3b8";
                  return (
                    <div key={p.id} onClick={() => router.push(`/admin/projects/${p.id}`)} style={{ padding: "11px 0", borderBottom: i < data.recentProjects.length - 1 ? "1px solid var(--color-border)" : "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>{p.name}</p>
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: `${color}15`, color }}>{STATUS_LABEL[p.status] ?? p.status}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        {displayName(p.client)} · {displayName(p.manager)}
                        {p.deadline && ` · Due ${new Date(p.deadline).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          }
        </Card>

        <Card title="Recent Activity" action={<button onClick={() => router.push("/admin/activity")} style={{ fontSize: "12px", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer" }}>View all →</button>}>
          {(data?.recentActivity?.length ?? 0) === 0
            ? <p style={{ fontSize: "13px", color: "var(--color-text-muted)", textAlign: "center", padding: "16px 0" }}>No activity yet</p>
            : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {data.recentActivity.slice(0, 7).map((log: any, i: number) => (
                  <div key={log.id} style={{ padding: "7px 0", borderBottom: i < 6 ? "1px solid var(--color-border)" : "none" }}>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-primary)" }}>{displayName(log.user)}</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{formatAction(log.action, log.meta)}</p>
                    <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{timeAgo(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            )
          }
        </Card>
      </div>
    </div>
  );
}
