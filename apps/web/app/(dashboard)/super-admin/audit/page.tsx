"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

interface AuditEntry {
  id:        string;
  action:    string;
  ip:        string | null;
  meta:      any;
  createdAt: string;
  user: {
    email:       string;
    displayName: string | null;
    firstName:   string | null;
    lastName:    string | null;
    role:        string;
  } | null;
}

function timeAgo(date: string) {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function actionLabel(action: string) {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

type ActionType = "success" | "info" | "danger" | "warning" | "default";

function actionType(action: string): ActionType {
  if (action.includes("LOGIN"))                                        return "success";
  if (action.includes("INVITE") || action.includes("REGISTER"))       return "info";
  if (action.includes("DELETE") || action.includes("REMOVE") || action.includes("SUSPEND")) return "danger";
  if (action.includes("PASSWORD") || action.includes("RESET"))        return "warning";
  return "default";
}

const ACTION_COLORS: Record<ActionType, { bg: string; color: string }> = {
  success: { bg: "var(--color-success-subtle)", color: "var(--color-success)" },
  info:    { bg: "var(--color-info-subtle)",    color: "var(--color-info)"    },
  danger:  { bg: "var(--color-danger-subtle)",  color: "var(--color-danger)"  },
  warning: { bg: "var(--color-warning-subtle)", color: "var(--color-warning)" },
  default: { bg: "var(--color-bg-subtle)",      color: "var(--color-text-muted)" },
};

export default function AuditLogPage() {
  const [logs,      setLogs]      = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);
  const [total,     setTotal]     = useState(0);

  const fetchLogs = useCallback(async (p: number) => {
    setIsLoading(true); setError(null);
    try {
      const res = await apiClient.get(endpoints.superAdmin.audit, { params: { page: p } });
      const d   = res.data?.data;
      setLogs(d?.logs ?? []);
      setPages(d?.pages ?? 1);
      setTotal(d?.total ?? 0);
    } catch {
      setError("Failed to load audit log.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(page); }, [fetchLogs, page]);

  const displayName = (u: AuditEntry["user"]) =>
    u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          Audit Log
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {total > 0 ? `${total.toLocaleString()} events recorded` : "Full history of platform events"}
        </p>
      </div>

      {/* Table card */}
      <div style={{
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--color-card-shadow)",
        overflow:     "hidden",
      }}>
        {isLoading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Loading…
          </div>
        ) : error ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "var(--color-danger)" }}>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "6px" }}>No events yet</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Events will appear here as users take actions</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Event", "User", "Role", "IP", "When"].map((h) => (
                  <th key={h} style={{
                    padding:       "12px 20px",
                    textAlign:     "left",
                    fontSize:      "11px",
                    fontWeight:    700,
                    color:         "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    background:    "var(--color-bg-subtle)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => {
                const type  = actionType(log.action);
                const style = ACTION_COLORS[type];
                return (
                  <tr
                    key={log.id}
                    style={{ borderBottom: i < logs.length - 1 ? "1px solid var(--color-border)" : "none", transition: "background var(--transition-fast)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg-subtle)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "13px 20px" }}>
                      <span style={{
                        fontSize:      "12px",
                        fontWeight:    600,
                        background:    style.bg,
                        color:         style.color,
                        padding:       "3px 10px",
                        borderRadius:  "var(--radius-pill)",
                        display:       "inline-block",
                        whiteSpace:    "nowrap",
                        textTransform: "capitalize",
                      }}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                        {displayName(log.user)}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        {log.user?.email ?? "—"}
                      </div>
                    </td>
                    <td style={{ padding: "13px 20px" }}>
                      {log.user?.role && (
                        <span style={{
                          fontSize:      "11px",
                          fontWeight:    600,
                          background:    "var(--color-accent-subtle)",
                          color:         "var(--color-accent)",
                          padding:       "2px 8px",
                          borderRadius:  "var(--radius-pill)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}>
                          {log.user.role.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "13px 20px", fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                      {log.ip ?? "—"}
                    </td>
                    <td style={{ padding: "13px 20px", fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {timeAgo(log.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
            Page {page} of {pages}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { label: "← Prev", disabled: page === 1,     action: () => setPage((p) => Math.max(1, p - 1))     },
              { label: "Next →", disabled: page === pages, action: () => setPage((p) => Math.min(pages, p + 1)) },
            ].map(({ label, disabled, action }) => (
              <button key={label} onClick={action} disabled={disabled} style={{
                padding:      "7px 16px",
                fontSize:     "13px",
                fontWeight:   500,
                background:   "var(--color-card-bg)",
                border:       "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color:        "var(--color-text-secondary)",
                cursor:       disabled ? "not-allowed" : "pointer",
                opacity:      disabled ? 0.4 : 1,
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
