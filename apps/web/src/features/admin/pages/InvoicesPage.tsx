"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/api/client";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:     { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", label: "Draft"     },
  SENT:      { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6", label: "Sent"      },
  PAID:      { bg: "rgba(34,197,94,0.1)",   color: "#22c55e", label: "Paid"      },
  OVERDUE:   { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", label: "Overdue"   },
  CANCELLED: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", label: "Cancelled" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function displayName(u: any) {
  return u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";
}

export function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices,   setInvoices]   = useState<any[]>([]);
  const [stats,      setStats]      = useState<any[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating,   setUpdating]   = useState<string | null>(null);

  const fetchInvoices = useCallback(async (p: number, filter: string, append = false) => {
    try {
      setIsLoading(!append);
      const params = new URLSearchParams({ page: String(p) });
      if (filter !== "ALL") params.set("status", filter);
      const { data } = await apiClient.get(`/admin/invoices?${params}`);
      const list = data.data?.invoices ?? [];
      setInvoices((prev) => append ? [...prev, ...list] : list);
      setStats(data.data?.stats ?? []);
      setTotal(data.data?.pagination?.total ?? 0);
      setHasMore(p < (data.data?.pagination?.pages ?? 1));
      setPage(p);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchInvoices(1, statusFilter); }, [statusFilter]);

  const handleStatusChange = async (inv: any, status: string) => {
    setUpdating(inv.id);
    try {
      await apiClient.patch(`/projects/${inv.project.id}/invoices/${inv.id}/status`, { status });
      setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status } : i));
    } finally { setUpdating(null); }
  };

  // Summary from stats
  const totalRevenue   = stats.find((s: any) => s.status === "PAID")?._sum?.amount ?? 0;
  const totalSent      = stats.find((s: any) => s.status === "SENT")?._sum?.amount ?? 0;
  const totalOverdue   = stats.find((s: any) => s.status === "OVERDUE")?._sum?.amount ?? 0;
  const totalDraft     = stats.find((s: any) => s.status === "DRAFT")?._sum?.amount ?? 0;

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "80px", color: "var(--color-text-muted)" }}>
      <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: "13px" }}>Loading invoices...</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Invoices</h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>All invoices across all projects — {total} total</p>
        </div>
      </div>

      {/* Revenue summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          { label: "Paid",        value: parseFloat(totalRevenue).toLocaleString(), color: "#22c55e" },
          { label: "Sent",        value: parseFloat(totalSent).toLocaleString(),    color: "#3b82f6" },
          { label: "Overdue",     value: parseFloat(totalOverdue).toLocaleString(), color: "#ef4444" },
          { label: "Draft",       value: parseFloat(totalDraft).toLocaleString(),   color: "#94a3b8" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "14px 18px", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-md)", boxShadow: "var(--color-card-shadow)" }}>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{label}</p>
            <p style={{ fontSize: "16px", fontWeight: 700, color }}>ZAR {value}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "5px 12px", fontSize: "12px", fontWeight: 500,
            borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)",
            cursor: "pointer",
            background: statusFilter === s ? "var(--color-accent)" : "var(--color-card-bg)",
            color: statusFilter === s ? "var(--color-accent-text)" : "var(--color-text-muted)",
          }}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div style={{ padding: "60px 40px", textAlign: "center", background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "6px" }}>No invoices found</p>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Invoices are generated when milestones are approved.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {invoices.map((inv: any) => {
              const isOverdue = inv.dueDate && inv.status === "SENT" && new Date(inv.dueDate) < new Date();
              const amount    = parseFloat(inv.amount);
              return (
                <div key={inv.id} style={{
                  padding: "14px 20px",
                  background: "var(--color-card-bg)",
                  border: `1px solid ${isOverdue ? "rgba(239,68,68,0.3)" : "var(--color-card-border)"}`,
                  borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", gap: "16px",
                }}>
                  {/* Invoice number + project */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "monospace" }}>{inv.invoiceNumber}</p>
                      {inv.isDeposit && <span style={{ fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "999px", background: "rgba(132,204,22,0.1)", color: "var(--color-accent)", border: "1px solid rgba(132,204,22,0.2)" }}>DEPOSIT</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {inv.project?.name} · {displayName(inv.project?.client)}
                    </p>
                    {inv.milestone && <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{inv.milestone.title}</p>}
                  </div>

                  {/* Amount */}
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)", flexShrink: 0 }}>
                    {inv.currency} {amount.toLocaleString()}
                  </p>

                  {/* Dates */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {inv.dueDate && <p style={{ fontSize: "11px", color: isOverdue ? "#ef4444" : "var(--color-text-muted)", fontWeight: isOverdue ? 600 : 400 }}>{isOverdue ? "⚠ " : ""}Due {new Date(inv.dueDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</p>}
                    {inv.paidAt  && <p style={{ fontSize: "11px", color: "#22c55e" }}>✓ {new Date(inv.paidAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</p>}
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                    <StatusBadge status={isOverdue ? "OVERDUE" : inv.status} />
                    {inv.status === "DRAFT" && (
                      <button onClick={() => handleStatusChange(inv, "SENT")} disabled={updating === inv.id} style={{ padding: "3px 10px", fontSize: "11px", fontWeight: 600, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "#3b82f6", opacity: updating === inv.id ? 0.6 : 1 }}>
                        Send
                      </button>
                    )}
                    <button onClick={() => router.push(`/admin/projects/${inv.project.id}`)} style={{ padding: "3px 10px", fontSize: "11px", fontWeight: 500, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-text-muted)" }}>
                      Project →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={() => fetchInvoices(page + 1, statusFilter, true)} style={{ padding: "9px 24px", fontSize: "13px", fontWeight: 500, background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--color-text-secondary)" }}>
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
