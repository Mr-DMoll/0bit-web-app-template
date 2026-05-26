"use client";

import { useEffect, useState } from "react";
import { UserPlus, Trash2, Mail } from "lucide-react";
import apiClient from "@/api/client";

interface Admin {
  id:            string;
  email:         string;
  firstName:     string | null;
  lastName:      string | null;
  displayName:   string | null;
  accountStatus: string;
  createdAt:     string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:  { bg: "var(--color-success-subtle)", color: "var(--color-success)" },
  PENDING: { bg: "var(--color-warning-subtle)", color: "var(--color-warning)" },
  DEFAULT: { bg: "var(--color-bg-subtle)",      color: "var(--color-text-muted)" },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background:   "var(--color-bg-subtle)",
  border:       "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize:     "14px",
  color:        "var(--color-text-primary)",
  outline:      "none",
  boxSizing:    "border-box",
};

export default function AdminsPage() {
  const [admins,    setAdmins]    = useState<Admin[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ email: "", firstName: "", lastName: "" });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  const fetchAdmins = () => {
    apiClient.get("/super-admin/admins")
      .then((r) => setAdmins(r.data?.data?.admins ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await apiClient.post("/super-admin/admins/invite", form);
      setShowModal(false);
      setForm({ email: "", firstName: "", lastName: "" });
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to invite admin");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string, email: string) => {
    if (!confirm(`Remove admin ${email}?`)) return;
    await apiClient.delete(`/super-admin/admins/${id}`);
    fetchAdmins();
  };

  const statusStyle = (status: string) =>
    STATUS_STYLE[status] ?? STATUS_STYLE.DEFAULT;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Admins
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Manage platform administrators
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "8px",
            padding:      "10px 18px",
            background:   "var(--color-accent)",
            border:       "none",
            borderRadius: "var(--radius-md)",
            fontSize:     "13.5px",
            fontWeight:   600,
            color:        "var(--color-accent-text)",
            cursor:       "pointer",
            transition:   "background var(--transition-fast)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-accent-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
        >
          <UserPlus size={15} strokeWidth={2} /> Invite Admin
        </button>
      </div>

      {/* Table card */}
      <div style={{
        background:   "var(--color-card-bg)",
        border:       "1px solid var(--color-card-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--color-card-shadow)",
        overflow:     "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
            Loading…
          </div>
        ) : admins.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "14px" }}>
            No admins yet. Invite one to get started.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Name", "Email", "Status", "Joined", ""].map((h) => (
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
              {admins.map((admin, i) => {
                const s = statusStyle(admin.accountStatus);
                return (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: i < admins.length - 1 ? "1px solid var(--color-border)" : "none", transition: "background var(--transition-fast)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--color-bg-subtle)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {admin.displayName ?? [admin.firstName, admin.lastName].filter(Boolean).join(" ") ?? "—"}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "14px", color: "var(--color-text-secondary)" }}>
                      {admin.email}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        padding:       "3px 10px",
                        borderRadius:  "var(--radius-pill)",
                        fontSize:      "11px",
                        fontWeight:    700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background:    s.bg,
                        color:         s.color,
                      }}>
                        {admin.accountStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleRemove(admin.id, admin.email)}
                        style={{
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          width:          "30px",
                          height:         "30px",
                          background:     "transparent",
                          border:         "none",
                          borderRadius:   "var(--radius-md)",
                          cursor:         "pointer",
                          color:          "var(--color-text-muted)",
                          transition:     "background var(--transition-fast), color var(--transition-fast)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--color-danger-subtle)";
                          e.currentTarget.style.color      = "var(--color-danger)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color      = "var(--color-text-muted)";
                        }}
                        title={`Remove ${admin.email}`}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite modal */}
      {showModal && (
        <div style={{
          position:       "fixed",
          inset:          0,
          background:     "rgba(0,0,0,0.55)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         50,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background:   "var(--color-card-bg)",
            border:       "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow:    "0 24px 64px rgba(0,0,0,0.2)",
            padding:      "32px",
            width:        "100%",
            maxWidth:     "420px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "6px" }}>
              Invite Admin
            </h2>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "24px" }}>
              They'll receive an email to set their password.
            </p>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Email address *" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input placeholder="First name" value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
                <input placeholder="Last name" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
              </div>
              {error && (
                <p style={{ fontSize: "13px", color: "var(--color-danger)", margin: 0 }}>{error}</p>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: "11px",
                  background:   "var(--color-bg-subtle)",
                  border:       "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize:     "14px",
                  color:        "var(--color-text-primary)",
                  cursor:       "pointer",
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{
                  flex:         1,
                  padding:      "11px",
                  background:   saving ? "var(--color-accent-subtle)" : "var(--color-accent)",
                  border:       "none",
                  borderRadius: "var(--radius-md)",
                  fontSize:     "14px",
                  fontWeight:   600,
                  color:        saving ? "var(--color-accent)" : "var(--color-accent-text)",
                  cursor:       saving ? "not-allowed" : "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  gap:          "8px",
                }}>
                  <Mail size={14} strokeWidth={2} />
                  {saving ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
