"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/client";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface LogUser { displayName?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; role?: string | null; }
interface LogEntry { id: string; action: string; meta: Record<string, unknown>; createdAt: string; user: LogUser | null; }

function displayName(u: LogUser | null) {
  return u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";
}

type ActionFn = (m: Record<string, unknown>) => { label: string; detail: string | null };

const ACTION_MAP: Record<string, ActionFn> = {
  LOGIN:                  ()  => ({ label: "Logged in",             detail: null }),
  POST_LOGOUT:            ()  => ({ label: "Logged out",            detail: null }),
  PASSWORD_SET:           ()  => ({ label: "Set password",          detail: null }),
  PASSWORD_RESET:         ()  => ({ label: "Reset password",        detail: null }),
  REGISTERED:             ()  => ({ label: "Registered",            detail: null }),
  ADMIN_INVITED:          (m) => ({ label: "Invited admin",         detail: (m?.email as string) ?? null }),
  ADMIN_SUSPENDED:        (m) => ({ label: "Suspended admin",       detail: (m?.email as string) ?? null }),
  ADMIN_ACTIVATED:        (m) => ({ label: "Activated admin",       detail: (m?.email as string) ?? null }),
  ADMIN_INVITE_RESENT:    (m) => ({ label: "Resent admin invite",   detail: (m?.email as string) ?? null }),
  ADMIN_DELETED:          (m) => ({ label: "Deleted admin",         detail: (m?.email as string) ?? null }),
  MANAGER_INVITED:        (m) => ({ label: "Invited manager",       detail: (m?.email as string) ?? null }),
  USER_INVITED:           (m) => ({ label: "Invited user",          detail: (m?.email as string) ?? null }),
  PROJECT_CREATED:        (m) => ({ label: "Created project",       detail: (m?.projectName as string) ?? null }),
  PROJECT_UPDATED:        ()  => ({ label: "Updated project",       detail: null }),
  PROJECT_STATUS_CHANGED: (m) => ({ label: "Changed project status", detail: m?.from && m?.to ? `${m.from} → ${m.to}` : null }),
  PROJECT_DELETED:        (m) => ({ label: "Deleted project",       detail: (m?.projectName as string) ?? null }),
  MILESTONE_CREATED:      (m) => ({ label: "Created milestone",     detail: (m?.title as string) ?? null }),
  MILESTONE_APPROVED:     ()  => ({ label: "Approved milestone",    detail: null }),
  DOCUMENT_CREATED:       (m) => ({ label: "Created document",      detail: (m?.title as string) ?? null }),
  INVOICE_STATUS_UPDATED: (m) => ({ label: "Updated invoice",       detail: (m?.newStatus as string) ?? null }),
  INTAKE_CONVERTED:       ()  => ({ label: "Converted intake",      detail: null }),
};

function formatAction(action: string, meta: Record<string, unknown>): { label: string; detail: string | null } {
  const fn = ACTION_MAP[action];
  return fn ? fn(meta) : { label: action.replace(/_/g, " ").toLowerCase(), detail: null };
}

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "var(--color-danger)",
  ADMIN:       "var(--color-warning)",
  MANAGER:     "var(--color-info)",
  USER:        "var(--color-accent)",
};

const ACTION_COLOR: Record<string, string> = {
  PROJECT_CREATED:        "var(--color-accent)",
  PROJECT_DELETED:        "var(--color-danger)",
  MILESTONE_APPROVED:     "var(--color-success)",
  INVOICE_STATUS_UPDATED: "var(--color-info)",
  DOCUMENT_CREATED:       "#a855f7",
  PROJECT_STATUS_CHANGED: "var(--color-warning)",
  LOGIN:                  "var(--color-success)",
  POST_LOGOUT:            "#94a3b8",
};

function groupByDate(logs: LogEntry[]) {
  const groups: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    const key = new Date(log.createdAt).toLocaleDateString("en-ZA", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    (groups[key] ??= []).push(log);
  }
  return groups;
}

// ── Date preset helpers ───────────────────────────────────────────────────────

type Preset = "all" | "today" | "week" | "month" | "custom";

function presetToDates(preset: Preset): { from: string; to: string } | null {
  const now   = new Date();
  const today = now.toISOString().slice(0, 10);

  if (preset === "today") return { from: today, to: today };

  if (preset === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { from: d.toISOString().slice(0, 10), to: today };
  }

  if (preset === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { from: d.toISOString().slice(0, 10), to: today };
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const chip = (active: boolean): React.CSSProperties => ({
  padding:      "6px 14px",
  fontSize:     "12px",
  fontWeight:   active ? 600 : 400,
  borderRadius: "var(--radius-md)",
  border:       `1px solid ${active ? "var(--color-accent)" : "var(--color-card-border)"}`,
  background:   active ? "var(--color-accent)15" : "var(--color-card-bg)",
  color:        active ? "var(--color-accent)" : "var(--color-text-secondary)",
  cursor:       "pointer",
  whiteSpace:   "nowrap" as const,
});

const inputStyle: React.CSSProperties = {
  padding:      "7px 12px",
  background:   "var(--color-card-bg)",
  border:       "1px solid var(--color-card-border)",
  borderRadius: "var(--radius-md)",
  fontSize:     "12px",
  color:        "var(--color-text-primary)",
  outline:      "none",
  cursor:       "pointer",
};

function openDatePicker(e: React.MouseEvent<HTMLInputElement>) {
  (e.currentTarget as HTMLInputElement).showPicker?.();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminActivityPage() {
  const [logs,          setLogs]          = useState<LogEntry[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [total,         setTotal]         = useState(0);

  // Filters
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("");
  const [preset,  setPreset]  = useState<Preset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const buildParams = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p) });
    if (debouncedSearch) params.set("action", debouncedSearch);
    if (role)            params.set("role",   role);

    const dates = preset === "custom"
      ? (fromDate || toDate ? { from: fromDate, to: toDate } : null)
      : presetToDates(preset);

    if (dates?.from) params.set("from", dates.from);
    if (dates?.to)   params.set("to",   dates.to);
    return params;
  }, [debouncedSearch, role, preset, fromDate, toDate]);

  const fetchLogs = useCallback(async (p: number, append = false) => {
    try {
      append ? setIsLoadingMore(true) : setIsLoading(true);
      const { data } = await apiClient.get(`/admin/activity?${buildParams(p)}`);
      const newLogs  = data.data?.logs ?? [];
      setLogs((prev) => append ? [...prev, ...newLogs] : newLogs);
      setTotal(data.data?.pagination?.total ?? 0);
      setHasMore(p < (data.data?.pagination?.pages ?? 1));
      setPage(p);
    } catch { /* silent */ }
    finally { setIsLoading(false); setIsLoadingMore(false); }
  }, [buildParams]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const grouped = groupByDate(logs);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Activity</h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>Full audit log — all team actions</p>
        </div>
        {total > 0 && (
          <div style={{ padding: "6px 14px", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{total} total actions</span>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)" }}>

        {/* Row 1: search + role */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action (e.g. LOGIN, PROJECT, INVITE)..."
            style={{ ...inputStyle, flex: 1, minWidth: "200px", padding: "8px 14px", fontSize: "13px" }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ ...inputStyle, paddingRight: "28px" }}
          >
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">User</option>
          </select>
        </div>

        {/* Row 2: date presets */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginRight: "4px" }}>Period:</span>
          {(["all", "today", "week", "month", "custom"] as Preset[]).map((p) => (
            <button key={p} onClick={() => setPreset(p)} style={chip(preset === p)}>
              {p === "all" ? "All time" : p === "today" ? "Today" : p === "week" ? "Last 7 days" : p === "month" ? "Last 30 days" : "Custom range"}
            </button>
          ))}
        </div>

        {/* Row 3: custom date inputs (only when custom selected) */}
        {preset === "custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onClick={openDatePicker}
              onChange={(e) => setFromDate(e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>to</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={new Date().toISOString().slice(0, 10)}
              onClick={openDatePicker}
              onChange={(e) => setToDate(e.target.value)}
              style={inputStyle}
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); }}
                style={{ fontSize: "12px", color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Log list */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px", color: "var(--color-text-muted)" }}>
          <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px" }}>Loading activity...</span>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ padding: "60px 40px", textAlign: "center", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "6px" }}>No matching activity</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {Object.entries(grouped).map(([date, dayLogs]) => (
            <div key={date}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{date}</p>
                <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
              </div>

              <div style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                {dayLogs.map((log, i) => {
                  const { label, detail } = formatAction(log.action, log.meta);
                  const dotColor  = ACTION_COLOR[log.action]  ?? "#94a3b8";
                  const roleColor = ROLE_COLOR[log.user?.role ?? ""] ?? "#94a3b8";
                  return (
                    <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "13px 20px", borderBottom: i < dayLogs.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: "5px" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "2px" }}>{label}</p>
                        {detail && <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginBottom: "2px" }}>{detail}</p>}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{displayName(log.user)}</p>
                          <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "999px", background: `${roleColor}15`, color: roleColor, textTransform: "uppercase" }}>
                            {log.user?.role?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--color-text-muted)", flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => fetchLogs(page + 1, true)}
                disabled={isLoadingMore}
                style={{ padding: "9px 24px", fontSize: "13px", fontWeight: 500, background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", opacity: isLoadingMore ? 0.6 : 1 }}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
