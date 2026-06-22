"use client";

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    ACTIVE:    { background: "rgba(34,197,94,0.1)",   color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)"   },
    PENDING:   { background: "rgba(245,158,11,0.1)",  color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)"  },
    SUSPENDED: { background: "rgba(239,68,68,0.1)",   color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)"   },
    DELETED:   { background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 500,
      ...(styles[status] ?? styles.DELETED),
    }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, React.CSSProperties> = {
    ADMIN:     { background: "rgba(239,68,68,0.1)",   color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)"   },
    MANAGER:   { background: "rgba(59,130,246,0.1)",  color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)"  },
    DEVELOPER: { background: "rgba(168,85,247,0.1)",  color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)"  },
    CLIENT:    { background: "var(--color-accent-subtle)",  color: "var(--color-accent)", border: "1px solid var(--color-accent-border)"  },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 500,
      ...(styles[role] ?? styles.CLIENT),
    }}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: "32px", height: "32px",
      borderRadius: "50%",
      background: "rgba(132,204,22,0.15)",
      border: "1px solid var(--color-accent-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      fontSize: "11px", fontWeight: 700,
      color: "var(--color-accent)",
    }}>
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ onClose, title, children }: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "440px",
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-muted)", fontSize: "18px", lineHeight: 1,
              padding: "2px 6px", borderRadius: "4px",
            }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, confirmLabel, danger = false, onConfirm, onCancel }: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      />
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "360px",
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "8px" }}>{title}</h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "9px 16px", fontSize: "13px", fontWeight: 500,
            background: "var(--color-bg)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)", cursor: "pointer",
            color: "var(--color-text-secondary)",
          }}>
            Cancel
          </button>
          <button
            onClick={async () => { setIsLoading(true); await onConfirm(); setIsLoading(false); }}
            disabled={isLoading}
            style={{
              flex: 1, padding: "9px 16px", fontSize: "13px", fontWeight: 600,
              background: danger ? "#ef4444" : "var(--color-accent)",
              border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: danger ? "#fff" : "var(--color-accent-text)",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function FormInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%", padding: "9px 14px",
          background: "var(--color-bg)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)", fontSize: "13px",
          color: "var(--color-text-primary)", outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.15)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ─── RadioOption ──────────────────────────────────────────────────────────────
export function RadioOption({ value, checked, onChange, label, description }: {
  value: string; checked: boolean; onChange: () => void;
  label: string; description: string;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      padding: "12px", borderRadius: "var(--radius-sm)",
      border: `1px solid ${checked ? "var(--color-accent)" : "var(--color-border)"}`,
      background: checked ? "rgba(132,204,22,0.05)" : "transparent",
      cursor: "pointer", transition: "all 0.15s ease",
    }}>
      <input type="radio" value={value} checked={checked} onChange={onChange} style={{ marginTop: "2px", accentColor: "var(--color-accent)" }} />
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</p>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{description}</p>
      </div>
    </label>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────
export function ActionButton({ onClick, disabled, variant = "default", children }: {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger" | "warning" | "success";
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" },
    primary: { background: "var(--color-accent)", border: "none", color: "var(--color-accent-text)" },
    danger:  { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" },
    warning: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" },
    success: { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 10px", fontSize: "12px", fontWeight: 500,
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── StatGrid ─────────────────────────────────────────────────────────────────
export function StatGrid({ stats }: { stats: { label: string; value: string | number; color?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: "12px" }}>
      {stats.map(({ label, value, color }) => (
        <div key={label} style={{
          padding: "14px 18px",
          background: "var(--color-card-bg)",
          border: "1px solid var(--color-card-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--color-card-shadow)",
        }}>
          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ fontSize: "26px", fontWeight: 300, color: color ?? "var(--color-text-primary)", lineHeight: 1 }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────
export function TabBar<T extends string>({ tabs, active, onChange }: {
  tabs: { key: T; label: string; count?: number }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div style={{
      display: "flex", gap: "2px",
      background: "var(--color-card-bg)",
      border: "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-md)",
      padding: "4px",
      width: "fit-content",
    }}>
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: "6px 14px", fontSize: "13px", fontWeight: 500,
            borderRadius: "var(--radius-sm)",
            background: active === key ? "var(--color-accent)" : "transparent",
            color: active === key ? "var(--color-accent-text)" : "var(--color-text-muted)",
            border: "none", cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {label}
          {count !== undefined && (
            <span style={{
              marginLeft: "6px", fontSize: "11px",
              color: active === key ? "var(--color-accent-text)" : "var(--color-text-muted)",
              opacity: 0.7,
            }}>
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, children, loading, error, empty }: {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--color-card-bg)",
      border: "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: "var(--color-card-shadow)",
    }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "60px", color: "var(--color-text-muted)" }}>
          <div style={{ width: "16px", height: "16px", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "13px" }}>Loading...</span>
        </div>
      ) : error ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
          <p style={{ fontSize: "13px", color: "#ef4444" }}>{error}</p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "11px", fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
      {!loading && !error && empty}
    </div>
  );
}

// ─── TableRow ─────────────────────────────────────────────────────────────────
export function TableRow({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: "1px solid var(--color-border)",
        cursor: onClick ? "pointer" : undefined,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-bg)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </tr>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
      {children}
    </td>
  );
}

// Need React for useState in ConfirmDialog
import React from "react";
