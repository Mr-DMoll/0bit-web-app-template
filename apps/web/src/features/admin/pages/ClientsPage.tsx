"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/client";

function displayName(u: any) {
  return u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";
}

function initials(u: any) {
  return displayName(u).split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "var(--color-accent)", INTAKE: "var(--color-text-muted)", SCOPE_DRAFT: "var(--color-warning)",
  IN_DESIGN: "var(--color-info)", CONTRACT_DRAFT: "#a855f7",
  COMPLETE: "var(--color-success)", ON_HOLD: "var(--color-warning)", ARCHIVED: "var(--color-text-muted)",
};

export function AdminClientsPage() {
  const router = useRouter();
  const [clients,   setClients]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/admin/clients").then((r) => setClients(r.data.data?.clients ?? [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    !search || displayName(c).toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px", color: "var(--color-text-muted)" }}>
      <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: "13px" }}>Loading clients...</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Clients</h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>{clients.length} total client{clients.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." style={{ width: "100%", padding: "9px 14px", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }} />

      {/* Client list */}
      {filtered.length === 0 ? (
        <div style={{ padding: "60px 40px", textAlign: "center", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "6px" }}>{search ? "No clients match your search" : "No clients yet"}</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Clients are added when provisioned by a manager.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((client: any) => (
            <div key={client.id} style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--color-card-shadow)", overflow: "hidden" }}>
              {/* Client row */}
              <div
                onClick={() => setExpanded(expanded === client.id ? null : client.id)}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", cursor: "pointer" }}
              >
                {/* Avatar */}
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(132,204,22,0.15)", border: "1px solid rgba(132,204,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--color-accent)", overflow: "hidden", flexShrink: 0 }}>
                  {client.avatarUrl ? <img src={client.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(client)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{displayName(client)}</p>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{client.email}</p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Projects</p>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>{client.clientProjects?.length ?? 0}</p>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)", transform: expanded === client.id ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                </div>
              </div>

              {/* Projects expand */}
              {expanded === client.id && (
                <div style={{ borderTop: "1px solid var(--color-border)", padding: "12px 20px" }}>
                  {(client.clientProjects?.length ?? 0) === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)", padding: "8px 0" }}>No projects assigned</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {client.clientProjects.map((p: any) => {
                        const color  = STATUS_COLOR[p.status] ?? "#94a3b8";
                        const budget = p.budget ? parseFloat(p.budget) : null;
                        const spent  = p.spent  ? parseFloat(p.spent)  : 0;
                        const pct    = budget   ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
                        return (
                          <div
                            key={p.id}
                            onClick={() => router.push(`/admin/projects/${p.id}`)}
                            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{p.name}</p>
                                <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "999px", background: `${color}15`, color }}>{p.status.replace(/_/g, " ")}</span>
                              </div>
                              {budget && (
                                <div style={{ height: "3px", background: "var(--color-border)", borderRadius: "999px", overflow: "hidden", marginTop: "4px" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-accent)", borderRadius: "999px" }} />
                                </div>
                              )}
                            </div>
                            {budget && (
                              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                                {p.currency} {budget.toLocaleString()}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
