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

export default function AdminsPage() {
  const [admins,  setAdmins]  = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");

  const fetchAdmins = () => {
    apiClient.get("/super-admin/admins")
      .then((r) => setAdmins(r.data?.data?.admins ?? []))
      .catch(console.error)
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    background: "var(--color-bg-subtle)",
    border: "1px solid var(--color-card-border)",
    borderRadius: "8px", fontSize: "14px",
    color: "var(--color-text-primary)", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "4px" }}>
            Admins
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Manage platform administrators
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px",
            background: "#84cc16", border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: 700, color: "#0f172a", cursor: "pointer",
          }}
        >
          <UserPlus size={16} /> Invite Admin
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        borderRadius: "12px", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading...</div>
        ) : admins.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
            No admins yet. Invite one to get started.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-card-border)" }}>
                {["Name", "Email", "Status", "Joined", ""].map((h) => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700,
                    color: "var(--color-text-muted)", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: "1px solid var(--color-card-border)" }}>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-primary)", fontSize: "14px" }}>
                    {admin.displayName ?? [admin.firstName, admin.lastName].filter(Boolean).join(" ") ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-secondary)", fontSize: "14px" }}>
                    {admin.email}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "999px",
                      fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                      background: admin.accountStatus === "ACTIVE" ? "rgba(132,204,22,0.1)" : "rgba(245,158,11,0.1)",
                      color:      admin.accountStatus === "ACTIVE" ? "#84cc16" : "#f59e0b",
                    }}>
                      {admin.accountStatus}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--color-text-muted)", fontSize: "13px" }}>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => handleRemove(admin.id, admin.email)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--color-text-muted)", padding: "4px",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }}>
          <div style={{
            background: "var(--color-card-bg)",
            border: "1px solid var(--color-card-border)",
            borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px",
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "24px" }}>
              Invite Admin
            </h2>
            <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <input
                placeholder="Email address *"
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                style={inputStyle}
              />
              {error && (
                <p style={{ color: "#f87171", fontSize: "13px" }}>{error}</p>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: "11px",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-card-border)",
                    borderRadius: "8px", fontSize: "14px",
                    color: "var(--color-text-primary)", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  style={{
                    flex: 1, padding: "11px",
                    background: saving ? "rgba(132,204,22,0.5)" : "#84cc16",
                    border: "none", borderRadius: "8px",
                    fontSize: "14px", fontWeight: 700,
                    color: "#0f172a", cursor: saving ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}
                >
                  <Mail size={15} />
                  {saving ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
