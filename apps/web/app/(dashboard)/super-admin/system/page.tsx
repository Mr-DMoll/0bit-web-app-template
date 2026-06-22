"use client";

import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

interface Settings {
  registration_mode?: string;
  maintenance_mode?:  string;
}

function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width:      "44px",
        height:     "24px",
        borderRadius: "var(--radius-pill)",
        background: checked ? "var(--color-accent)" : "var(--color-border)",
        border:     "none",
        cursor:     disabled ? "not-allowed" : "pointer",
        position:   "relative",
        transition: "background var(--transition-base)",
        flexShrink: 0,
        opacity:    disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position:     "absolute",
        top:          "3px",
        left:         checked ? "23px" : "3px",
        width:        "18px",
        height:       "18px",
        borderRadius: "var(--radius-pill)",
        background:   "#fff",
        transition:   "left var(--transition-base)",
        boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background:   "var(--color-card-bg)",
      border:       "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-xl)",
      boxShadow:    "var(--color-card-shadow)",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:      "14px 24px",
        borderBottom: "1px solid var(--color-border)",
        background:   "var(--color-bg-subtle)",
      }}>
        <p style={{
          fontSize:      "11px",
          fontWeight:    700,
          color:         "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin:        0,
        }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string; description: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      gap:            "24px",
      padding:        "20px 24px",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
          {label}
        </p>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function SystemPage() {
  const [settings,  setSettings]  = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    apiClient.get(endpoints.superAdmin.settings)
      .then((r) => setSettings(r.data?.data?.settings ?? {}))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSaving(key);
    try {
      await apiClient.put(endpoints.superAdmin.settings, { key, value });
      setSettings((prev) => ({ ...prev, [key]: value }));
      setToast({ msg: "Setting saved", ok: true });
    } catch {
      setToast({ msg: "Failed to save", ok: false });
    } finally {
      setSaving(null);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const registrationMode = settings.registration_mode ?? "INVITE_ONLY";
  const maintenanceMode  = settings.maintenance_mode === "true";

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--color-text-muted)", fontSize: "14px" }}>
      Loading…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          System Settings
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Platform-wide configuration. Changes take effect immediately.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:     "fixed",
          bottom:       "24px",
          right:        "24px",
          zIndex:       100,
          padding:      "12px 20px",
          background:   toast.ok ? "var(--color-success)" : "var(--color-danger)",
          borderRadius: "var(--radius-lg)",
          fontSize:     "13px",
          fontWeight:   600,
          color:        "#fff",
          boxShadow:    "0 8px 24px rgba(0,0,0,0.2)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Maintenance warning banner */}
      {maintenanceMode && (
        <div style={{
          padding:      "14px 20px",
          background:   "var(--color-danger-subtle)",
          border:       "1px solid var(--color-danger)",
          borderRadius: "var(--radius-lg)",
          display:      "flex",
          alignItems:   "center",
          gap:          "12px",
        }}>
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <p style={{ fontSize: "13px", color: "var(--color-danger)", margin: 0, lineHeight: 1.5 }}>
            <strong>Maintenance mode is active.</strong> All users except Super Admin are seeing the maintenance page.
          </p>
        </div>
      )}

      {/* Access & Registration */}
      <SectionCard title="Access & Registration">
        <SettingRow
          label="Registration mode"
          description="Controls how new users can join the platform."
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {([
              { value: "INVITE_ONLY", label: "Invite only" },
              { value: "OPEN",        label: "Open"        },
            ] as const).map(({ value, label }) => {
              const active = registrationMode === value;
              return (
                <button
                  key={value}
                  onClick={() => updateSetting("registration_mode", value)}
                  disabled={saving === "registration_mode"}
                  style={{
                    padding:      "7px 16px",
                    fontSize:     "13px",
                    fontWeight:   600,
                    borderRadius: "var(--radius-md)",
                    cursor:       "pointer",
                    border:       active ? "1px solid var(--color-accent-border)" : "1px solid var(--color-border)",
                    background:   active ? "var(--color-accent-subtle)"           : "var(--color-bg-subtle)",
                    color:        active ? "var(--color-accent)"                  : "var(--color-text-muted)",
                    transition:   "all var(--transition-fast)",
                    opacity:      saving === "registration_mode" ? 0.6 : 1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </SettingRow>
      </SectionCard>

      {/* Availability */}
      <SectionCard title="Availability">
        <SettingRow
          label="Maintenance mode"
          description="When enabled, all non-Super Admin users see a maintenance page."
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {maintenanceMode && (
              <span style={{
                fontSize:      "11px",
                fontWeight:    700,
                color:         "var(--color-danger)",
                background:    "var(--color-danger-subtle)",
                border:        "1px solid var(--color-danger)",
                padding:       "2px 8px",
                borderRadius:  "var(--radius-pill)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}>
                Active
              </span>
            )}
            <Toggle
              checked={maintenanceMode}
              disabled={saving === "maintenance_mode"}
              onChange={(v) => updateSetting("maintenance_mode", String(v))}
            />
          </div>
        </SettingRow>
      </SectionCard>

    </div>
  );
}
