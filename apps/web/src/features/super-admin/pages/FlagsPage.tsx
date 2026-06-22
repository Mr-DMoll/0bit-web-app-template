"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface Flag {
  key:         string;
  label:       string;
  description: string;
  enabled:     boolean;
  group:       string;
}

const DEFAULT_FLAGS: Flag[] = [
  { key: "user_registration",     label: "User Registration",      description: "Allow new users to self-register",              enabled: true,  group: "Auth"     },
  { key: "google_oauth",          label: "Google OAuth",           description: "Enable Sign in with Google",                    enabled: true,  group: "Auth"     },
  { key: "email_invites",         label: "Email Invitations",      description: "Allow admins to invite users via email",         enabled: true,  group: "Auth"     },
  { key: "maintenance_mode",      label: "Maintenance Mode",       description: "Show maintenance page to all non-super-admins",  enabled: false, group: "Platform" },
  { key: "notifications",         label: "Notifications",          description: "Enable in-app notification system",              enabled: true,  group: "Platform" },
  { key: "audit_logging",         label: "Audit Logging",          description: "Log all user actions to the audit trail",        enabled: true,  group: "Platform" },
];

export default function FlagsPage() {
  const [flags,  setFlags]  = useState<Flag[]>(DEFAULT_FLAGS);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (key: string) => {
    setSaving(key);
    await new Promise((r) => setTimeout(r, 300));
    setFlags((prev) =>
      prev.map((f) => f.key === key ? { ...f, enabled: !f.enabled } : f)
    );
    setSaving(null);
  };

  const groups = [...new Set(flags.map((f) => f.group))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          Feature Flags
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Toggle platform features on or off
        </p>
      </div>

      {groups.map((group) => (
        <div key={group}>
          <h2 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
            {group}
          </h2>
          <div style={{
            background:   "var(--color-card-bg)",
            border:       "1px solid var(--color-card-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow:    "var(--color-card-shadow)",
            overflow:     "hidden",
          }}>
            {flags.filter((f) => f.group === group).map((flag, i, arr) => (
              <div
                key={flag.key}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "space-between",
                  padding:        "18px 24px",
                  borderBottom:   i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                  transition:     "background var(--transition-fast)",
                  opacity:        saving === flag.key ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {flag.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    {flag.description}
                  </div>
                </div>

                <button
                  onClick={() => toggle(flag.key)}
                  disabled={saving === flag.key}
                  title={flag.enabled ? "Disable" : "Enable"}
                  style={{
                    background: "none",
                    border:     "none",
                    cursor:     saving === flag.key ? "wait" : "pointer",
                    color:      flag.enabled ? "var(--color-success)" : "var(--color-text-muted)",
                    display:    "flex",
                    alignItems: "center",
                    padding:    "4px",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  {flag.enabled
                    ? <ToggleRight size={28} strokeWidth={1.5} />
                    : <ToggleLeft  size={28} strokeWidth={1.5} />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center" }}>
        Flags are stored locally for now. Connect to <code>/super-admin/settings</code> to persist them.
      </p>
    </div>
  );
}
