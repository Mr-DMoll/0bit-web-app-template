"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus } from "lucide-react";
import { adminService, type TeamUser } from "../services/admin.service";

// ─── Shared input style ────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "10px 14px",
  background:   "var(--color-bg-subtle)",
  border:       "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize:     "14px",
  color:        "var(--color-text-primary)",
  outline:      "none",
  boxSizing:    "border-box",
  transition:   "border-color var(--transition-fast), box-shadow var(--transition-fast)",
};

const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "var(--color-accent)";
  e.target.style.boxShadow   = "0 0 0 3px var(--color-accent-subtle)";
};
const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "var(--color-border)";
  e.target.style.boxShadow   = "none";
};

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    ACTIVE:    { background: "var(--color-success-subtle)", color: "var(--color-success)", border: "1px solid var(--color-success-subtle)" },
    PENDING:   { background: "var(--color-warning-subtle)", color: "var(--color-warning)", border: "1px solid var(--color-warning-subtle)" },
    SUSPENDED: { background: "var(--color-danger-subtle)",  color: "var(--color-danger)",  border: "1px solid var(--color-danger-subtle)"  },
  };
  const s = styles[status] ?? styles.PENDING;
  return (
    <span style={{
      ...s,
      display:       "inline-flex",
      alignItems:    "center",
      padding:       "3px 10px",
      borderRadius:  "var(--radius-pill)",
      fontSize:      "11px",
      fontWeight:    700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {status}
    </span>
  );
}

// ─── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose, onSubmit }: {
  onClose:  () => void;
  onSubmit: (email: string) => Promise<void>;
}) {
  const [email,        setEmail]        = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true); setError(null);
    try {
      await onSubmit(email.trim().toLowerCase());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send invite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{
        position:     "relative",
        zIndex:       10,
        width:        "100%",
        maxWidth:     "420px",
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding:      "32px",
        boxShadow:    "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>Invite Manager</h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              They'll receive an email to set their password.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "18px", lineHeight: 1, padding: "4px" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Email address
            </label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
              required autoFocus
              style={inputStyle}
              onFocus={focusBorder} onBlur={blurBorder}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "var(--color-danger-subtle)", border: "1px solid var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--color-danger)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "10px",
              background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)", fontSize: "14px", fontWeight: 500,
              color: "var(--color-text-secondary)", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !email.trim()} style={{
              flex: 1, padding: "10px",
              background: isSubmitting || !email.trim() ? "var(--color-accent-subtle)" : "var(--color-accent)",
              border: "none", borderRadius: "var(--radius-md)",
              fontSize: "14px", fontWeight: 600,
              color: isSubmitting || !email.trim() ? "var(--color-accent)" : "var(--color-accent-text)",
              cursor: isSubmitting || !email.trim() ? "not-allowed" : "pointer",
            }}>
              {isSubmitting ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string;
  danger?: boolean; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} onClick={onCancel} />
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "360px",
        background: "var(--color-card-bg)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)", padding: "28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 8px" }}>{title}</h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px",
            background: "var(--color-bg-subtle)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: 500,
            color: "var(--color-text-secondary)", cursor: "pointer",
          }}>
            Cancel
          </button>
          <button
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
            disabled={busy}
            style={{
              flex: 1, padding: "10px",
              background: danger ? "var(--color-danger)" : "var(--color-accent)",
              border: "none", borderRadius: "var(--radius-md)",
              fontSize: "13px", fontWeight: 700,
              color: "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manager row ───────────────────────────────────────────────────────────────
function ManagerRow({ manager, onStatusChange, onRefetch }: {
  manager: TeamUser;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onRefetch: () => void;
}) {
  const [confirm, setConfirm] = useState<"suspend" | "activate" | null>(null);

  const name = manager.displayName ||
    [manager.firstName, manager.lastName].filter(Boolean).join(" ") ||
    manager.email;
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <tr
        style={{ borderBottom: "1px solid var(--color-border)", transition: "background var(--transition-fast)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg-subtle)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
      >
        {/* Name + email */}
        <td style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "var(--radius-pill)",
              background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
            </div>
            <div>
              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.2 }}>{name}</p>
              {name !== manager.email && (
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "2px 0 0" }}>{manager.email}</p>
              )}
            </div>
          </div>
        </td>

        {/* Status */}
        <td style={{ padding: "14px 20px" }}>
          <StatusBadge status={manager.accountStatus} />
        </td>

        {/* Joined */}
        <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          {new Date(manager.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </td>

        {/* Actions */}
        <td style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {manager.accountStatus === "ACTIVE" && (
              <button onClick={() => setConfirm("suspend")} style={{
                padding: "4px 12px", fontSize: "12px", fontWeight: 600,
                color: "var(--color-warning)", background: "var(--color-warning-subtle)",
                border: "1px solid var(--color-warning-subtle)", borderRadius: "var(--radius-md)", cursor: "pointer",
              }}>
                Suspend
              </button>
            )}
            {manager.accountStatus === "SUSPENDED" && (
              <button onClick={() => setConfirm("activate")} style={{
                padding: "4px 12px", fontSize: "12px", fontWeight: 600,
                color: "var(--color-accent)", background: "var(--color-accent-subtle)",
                border: "1px solid var(--color-accent-border)", borderRadius: "var(--radius-md)", cursor: "pointer",
              }}>
                Activate
              </button>
            )}
            {manager.accountStatus === "PENDING" && (
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                Invite pending
              </span>
            )}
          </div>
        </td>
      </tr>

      {confirm === "suspend" && (
        <ConfirmDialog
          title="Suspend manager?"
          message={`${name} will lose access immediately.`}
          confirmLabel="Suspend" danger
          onConfirm={async () => { await onStatusChange(manager.id, "SUSPENDED"); setConfirm(null); onRefetch(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === "activate" && (
        <ConfirmDialog
          title="Reactivate manager?"
          message={`${name} will regain full access.`}
          confirmLabel="Activate"
          onConfirm={async () => { await onStatusChange(manager.id, "ACTIVE"); setConfirm(null); onRefetch(); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ─── MANAGERS PAGE ─────────────────────────────────────────────────────────────
export function ManagersPage() {
  const [managers,   setManagers]   = useState<TeamUser[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const fetchManagers = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const res = await adminService.getManagers();
      setManagers(res.data?.managers ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load managers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchManagers(); }, [fetchManagers]);

  const handleInvite        = async (email: string) => { await adminService.inviteManager(email); await fetchManagers(); };
  const handleStatusChange  = async (id: string, status: string) => { await adminService.updateUserStatus(id, status); };

  const active    = managers.filter((m) => m.accountStatus === "ACTIVE").length;
  const pending   = managers.filter((m) => m.accountStatus === "PENDING").length;
  const suspended = managers.filter((m) => m.accountStatus === "SUSPENDED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Managers</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Project managers who oversee client delivery
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", background: "var(--color-accent)",
            border: "none", borderRadius: "var(--radius-md)",
            fontSize: "13.5px", fontWeight: 600, color: "var(--color-accent-text)", cursor: "pointer",
            transition: "background var(--transition-fast)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
        >
          <UserPlus size={15} strokeWidth={2} /> Invite Manager
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Active",    value: active,    color: "var(--color-success)", subtle: "var(--color-success-subtle)" },
          { label: "Pending",   value: pending,   color: "var(--color-warning)", subtle: "var(--color-warning-subtle)" },
          { label: "Suspended", value: suspended, color: "var(--color-danger)",  subtle: "var(--color-danger-subtle)"  },
        ].map(({ label, value, color, subtle }) => (
          <div key={label} style={{
            padding: "20px 24px",
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-card-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--color-card-shadow)",
          }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--color-card-shadow)",
        overflow: "hidden",
      }}>
        {isLoading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-danger)", fontSize: "14px" }}>{error}</div>
        ) : managers.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "8px" }}>No managers yet</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>Invite a manager to get started</p>
            <button onClick={() => setShowInvite(true)} style={{
              padding: "10px 20px", background: "var(--color-accent)", border: "none",
              borderRadius: "var(--radius-md)", fontSize: "13.5px", fontWeight: 600,
              color: "var(--color-accent-text)", cursor: "pointer",
            }}>
              Invite first manager
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Manager", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    background: "var(--color-bg-subtle)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <ManagerRow key={m.id} manager={m} onStatusChange={handleStatusChange} onRefetch={fetchManagers} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSubmit={handleInvite} />}
    </div>
  );
}
