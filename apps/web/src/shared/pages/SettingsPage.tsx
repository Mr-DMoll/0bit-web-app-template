"use client";

import { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--color-card-bg)",
      border: "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--color-card-shadow)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>{label}</p>
        {description && <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{description}</p>}
      </div>
      <button
        onClick={onChange}
        style={{
          width: "40px", height: "22px",
          borderRadius: "999px",
          background: checked ? "var(--color-accent)" : "var(--color-border)",
          border: "none", cursor: "pointer",
          position: "relative", flexShrink: 0,
          transition: "background 0.2s ease",
        }}
      >
        <div style={{
          position: "absolute", top: "3px",
          left: checked ? "21px" : "3px",
          width: "16px", height: "16px",
          borderRadius: "50%", background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />;
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  // Password change state
  const [pwForm, setPwForm]     = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError]   = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw]     = useState(false);

  // Notifications state (local only for now)
  const [notif, setNotif] = useState({
    emailMilestones: true,
    emailInvoices:   true,
    emailMessages:   false,
  });

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true); setPwError(null);
    try {
      await apiClient.patch(endpoints.users.password, {
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "13px", color: "var(--color-text-primary)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px"}}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Settings</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Manage your account preferences
        </p>
      </div>

      {/* Appearance */}
      <Card title="Appearance" subtitle="Customise how the platform looks for you">
        <Toggle
          checked={theme === "dark"}
          onChange={toggle}
          label="Dark mode"
          description="Switch between light and dark interface"
        />
      </Card>

      {/* Notifications */}
      <Card title="Notifications" subtitle="Choose what emails you receive">
        <Toggle
          checked={notif.emailMilestones}
          onChange={() => setNotif(p => ({ ...p, emailMilestones: !p.emailMilestones }))}
          label="Milestone updates"
          description="Get notified when milestones are approved or rejected"
        />
        <Divider />
        <Toggle
          checked={notif.emailInvoices}
          onChange={() => setNotif(p => ({ ...p, emailInvoices: !p.emailInvoices }))}
          label="Invoice activity"
          description="Get notified when invoices are sent or paid"
        />
        <Divider />
        <Toggle
          checked={notif.emailMessages}
          onChange={() => setNotif(p => ({ ...p, emailMessages: !p.emailMessages }))}
          label="Project messages"
          description="Get notified about new comments on your projects"
        />
      </Card>

      {/* Password */}
      <Card title="Password" subtitle="Change your account password">
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {pwSuccess && (
            <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "13px", color: "#22c55e" }}>
              Password updated successfully
            </div>
          )}
          {pwError && (
            <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "13px", color: "#ef4444" }}>
              {pwError}
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
              Current password
            </label>
            <input type={showPw ? "text" : "password"} value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
              New password
            </label>
            <input type={showPw ? "text" : "password"} value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} required minLength={8} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
              Confirm new password
            </label>
            <input type={showPw ? "text" : "password"} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={showPw} onChange={() => setShowPw(p => !p)} style={{ accentColor: "var(--color-accent)" }} />
              Show passwords
            </label>
            <button type="submit" disabled={pwSaving} style={{
              padding: "8px 20px", fontSize: "13px", fontWeight: 600,
              background: "var(--color-accent)", border: "none",
              borderRadius: "var(--radius-sm)", cursor: "pointer",
              color: "var(--color-accent-text)", opacity: pwSaving ? 0.6 : 1,
            }}>
              {pwSaving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <div style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#ef4444" }}>Danger Zone</h3>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
            Irreversible actions — proceed with caution
          </p>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)" }}>Sign out of all sessions</p>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                You will be logged out of all devices
              </p>
            </div>
            <button onClick={logout} style={{
              padding: "8px 16px", fontSize: "12px", fontWeight: 600,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-sm)", cursor: "pointer", color: "#ef4444",
              whiteSpace: "nowrap",
            }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
