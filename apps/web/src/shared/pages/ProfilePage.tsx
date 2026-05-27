"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

// ─── Role badge ───────────────────────────────────────────────────────────────
function RolePill({ role }: { role: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      background: "rgba(132,204,22,0.12)",
      color: "var(--color-accent)",
      border: "1px solid rgba(132,204,22,0.25)",
    }}>
      {role.replace(/_/g, " ")}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function AvatarSection({ user, onAvatarChange }: { user: any; onAvatarChange: (url: string) => void }) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const initials = (
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email || "?"
  ).split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Get presigned URL
      const { data } = await apiClient.post(endpoints.users.avatarPresign, {
        fileName: file.name,
        fileType: file.type,
      });
      // Upload to R2 (placeholder until R2 is wired)
      // await fetch(data.data.url, { method: "PUT", body: file });
      // For now just save the placeholder URL
      await apiClient.patch(endpoints.users.profile, { avatarUrl: data.data.url });
      onAvatarChange(data.data.url);
    } catch {
      // silent fail for now — R2 not yet wired
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {/* Avatar circle */}
      <div style={{ position: "relative" }}>
        <div style={{
          width: "72px", height: "72px",
          borderRadius: "50%",
          background: user?.avatarUrl ? "transparent" : "rgba(132,204,22,0.15)",
          border: "2px solid rgba(132,204,22,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-accent)" }}>{initials}</span>
          )}
        </div>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: "18px", height: "18px", border: "2px solid transparent", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}
      </div>

      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
          {user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email}
        </p>
        <RolePill role={user?.role ?? ""} />
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            display: "block", marginTop: "8px",
            fontSize: "12px", color: "var(--color-accent)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          Change photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function Field({ label, value, type = "text", name, editing, onChange }: {
  label: string;
  value: string;
  type?: string;
  name: string;
  editing: boolean;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
        {label}
      </p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          style={{
            width: "100%", padding: "8px 12px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px", color: "var(--color-text-primary)",
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(132,204,22,0.12)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <p style={{ fontSize: "13px", color: value ? "var(--color-text-primary)" : "var(--color-text-muted)", padding: "8px 0" }}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--color-card-bg)",
      border: "1px solid var(--color-card-border)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--color-card-shadow)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid var(--color-border)",
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  const buildForm = (u: typeof user) => ({
    firstName:   u?.firstName   ?? "",
    lastName:    u?.lastName    ?? "",
    displayName: u?.displayName ?? "",
    city:        u?.city        ?? "",
    country:     u?.country     ?? "",
    language:    u?.language    ?? "",
    dateOfBirth: u?.dateOfBirth
      ? new Date(u.dateOfBirth).toISOString().split("T")[0]
      : "",
  });

  const [form, setForm] = useState(() => buildForm(user));

  // Sync form when user data loads (guard renders before getMe resolves)
  useEffect(() => { setForm(buildForm(user)); }, [user?.id]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const { data } = await apiClient.patch(endpoints.users.profile, form);
      setUser({ ...user!, ...data.data.user });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(buildForm(user));
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--color-text-primary)" }}>Profile</h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          Manage your personal information
        </p>
      </div>

      {/* Avatar + identity */}
      <Card title="Identity">
        <AvatarSection
          user={user}
          onAvatarChange={(url) => setUser({ ...user!, avatarUrl: url })}
        />
      </Card>

      {/* Personal info */}
      <Card
        title="Personal Information"
        action={
          editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCancel} style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                background: "var(--color-bg)", border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-text-secondary)",
              }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 600,
                background: "var(--color-accent)", border: "none",
                borderRadius: "var(--radius-sm)", cursor: "pointer",
                color: "var(--color-accent-text)", opacity: saving ? 0.6 : 1,
              }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: 500,
              background: "var(--color-bg)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-text-secondary)",
            }}>Edit</button>
          )
        }
      >
        {success && (
          <div style={{
            marginBottom: "16px", padding: "10px 14px", borderRadius: "var(--radius-sm)",
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            fontSize: "13px", color: "#22c55e",
          }}>
            Profile updated successfully
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: "16px", padding: "10px 14px", borderRadius: "var(--radius-sm)",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            fontSize: "13px", color: "#ef4444",
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Field label="First Name"    value={form.firstName}   name="firstName"   editing={editing} onChange={handleChange} />
          <Field label="Last Name"     value={form.lastName}    name="lastName"    editing={editing} onChange={handleChange} />
          <Field label="Display Name"  value={form.displayName} name="displayName" editing={editing} onChange={handleChange} />
          <Field label="Date of Birth" value={form.dateOfBirth} name="dateOfBirth" type="date" editing={editing} onChange={handleChange} />
          <Field label="City"          value={form.city}        name="city"        editing={editing} onChange={handleChange} />
          <Field label="Country"       value={form.country}     name="country"     editing={editing} onChange={handleChange} />
          <Field label="Language"      value={form.language}    name="language"    editing={editing} onChange={handleChange} />
        </div>
      </Card>

      {/* Account info — read only */}
      <Card title="Account">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Email</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>{user?.email}</p>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Role</p>
            <RolePill role={user?.role ?? ""} />
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Account Status</p>
            <span style={{
              display: "inline-block", padding: "2px 10px", borderRadius: "999px",
              fontSize: "11px", fontWeight: 500,
              background: user?.accountStatus === "ACTIVE" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
              color: user?.accountStatus === "ACTIVE" ? "#22c55e" : "#f59e0b",
              border: `1px solid ${user?.accountStatus === "ACTIVE" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
            }}>
              {user?.accountStatus ?? "—"}
            </span>
          </div>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Member Since</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-primary)" }}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
                : "—"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
