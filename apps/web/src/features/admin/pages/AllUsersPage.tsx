"use client";

import { useState } from "react";
import { useTeamUsers } from "../hooks/useTeamUsers";
import type { TeamUser, StaffRole } from "../services/admin.service";
import {
  StatusBadge, RoleBadge, Avatar, Modal, ConfirmDialog,
  FormInput, RadioOption, PageHeader, StatGrid, TabBar,
  Table, TableRow, Td, ActionButton,
} from "@/shared/components/ui/UIComponents";

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (email: string, role: StaffRole) => Promise<void>;
}) {
  const [email, setEmail]           = useState("");
  const [role, setRole]             = useState<StaffRole>("MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const ROLES: { value: StaffRole; label: string; description: string }[] = [
    { value: "MANAGER",   label: "Manager",   description: "Manages projects and communicates with clients" },
    { value: "DEVELOPER", label: "Developer", description: "Works on project tasks and updates progress" },
    { value: "CLIENT",    label: "Client",    description: "Views project status, approves designs and invoices" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try { await onSubmit(email.trim().toLowerCase(), role); onClose(); }
    catch (err: any) { setError(err?.response?.data?.message ?? "Failed to add user."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Modal onClose={onClose} title="Add Team Member">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: "8px" }}>Role</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {ROLES.map(({ value, label, description }) => (
              <RadioOption key={value} value={value} checked={role === value} onChange={() => setRole(value)} label={label} description={description} />
            ))}
          </div>
        </div>
        <FormInput label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required autoFocus />
        {error && (
          <p style={{ fontSize: "13px", color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
            {error}
          </p>
        )}
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          An activation email will be sent. They will set their own password.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: "9px 16px", fontSize: "13px", fontWeight: 500,
            background: "var(--color-bg)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-text-secondary)",
          }}>Cancel</button>
          <button type="submit" disabled={isSubmitting || !email.trim()} style={{
            flex: 1, padding: "9px 16px", fontSize: "13px", fontWeight: 600,
            background: "var(--color-accent)", border: "none",
            borderRadius: "var(--radius-sm)", cursor: "pointer",
            color: "var(--color-accent-text)", opacity: isSubmitting || !email.trim() ? 0.5 : 1,
          }}>
            {isSubmitting ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── ALL USERS PAGE ───────────────────────────────────────────────────────────
export function AllUsersPage() {
  const { users, isLoading, error, provisionUser, suspendUser, activateUser, deleteUser, resendInvite } = useTeamUsers();

  const [activeTab, setActiveTab]         = useState<"ALL" | StaffRole>("ALL");
  const [showModal, setShowModal]         = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "activate" | "delete"; user: TeamUser } | null>(null);
  const [resendingId, setResendingId]     = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const TABS = [
    { key: "ALL" as const,       label: "All",        count: users.length },
    { key: "MANAGER" as const,   label: "Managers",   count: users.filter(u => u.role === "MANAGER").length },
    { key: "DEVELOPER" as const, label: "Developers", count: users.filter(u => u.role === "DEVELOPER").length },
    { key: "CLIENT" as const,    label: "Clients",    count: users.filter(u => u.role === "CLIENT").length },
  ];

  const filtered = activeTab === "ALL" ? users : users.filter(u => u.role === activeTab);

  const displayName = (u: TeamUser) =>
    u.displayName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;

  const initials = (u: TeamUser) =>
    displayName(u).split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleResend = async (user: TeamUser) => {
    setResendingId(user.id);
    try { await resendInvite(user.email); setResendSuccess(user.id); setTimeout(() => setResendSuccess(null), 3000); }
    finally { setResendingId(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader
        title="Team & Clients"
        subtitle="Manage all users — managers, developers, and clients"
        action={
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", fontSize: "13px", fontWeight: 600,
            background: "var(--color-accent)", border: "none",
            borderRadius: "var(--radius-md)", cursor: "pointer",
            color: "var(--color-accent-text)",
          }}>
            + Add User
          </button>
        }
      />

      <StatGrid stats={[
        { label: "Managers",   value: users.filter(u => u.role === "MANAGER").length,   color: "#3b82f6" },
        { label: "Developers", value: users.filter(u => u.role === "DEVELOPER").length, color: "#a855f7" },
        { label: "Clients",    value: users.filter(u => u.role === "CLIENT").length,    color: "#84cc16" },
        { label: "Total",      value: users.length },
      ]} />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Table
        headers={["User", "Role", "Status", "Added", "Actions"]}
        loading={isLoading}
        error={error}
        empty={filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "16px" }}>
              No {activeTab === "ALL" ? "users" : activeTab.toLowerCase() + "s"} yet
            </p>
            <button onClick={() => setShowModal(true)} style={{
              padding: "8px 18px", fontSize: "13px", fontWeight: 600,
              background: "var(--color-accent)", border: "none",
              borderRadius: "var(--radius-md)", cursor: "pointer",
              color: "var(--color-accent-text)",
            }}>Add first user</button>
          </div>
        ) : undefined}
      >
        {filtered.map((user) => (
          <TableRow key={user.id}>
            <Td>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar initials={initials(user)} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1 }}>{displayName(user)}</p>
                  {displayName(user) !== user.email && <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{user.email}</p>}
                </div>
              </div>
            </Td>
            <Td><RoleBadge role={user.role} /></Td>
            <Td><StatusBadge status={user.accountStatus} /></Td>
            <Td>{new Date(user.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</Td>
            <Td>
              <div style={{ display: "flex", gap: "6px" }}>
                {user.accountStatus === "PENDING" && (
                  <ActionButton onClick={() => handleResend(user)} disabled={resendingId === user.id} variant="default">
                    {resendingId === user.id ? "Sending..." : resendSuccess === user.id ? "✓ Sent" : "Resend"}
                  </ActionButton>
                )}
                {user.accountStatus === "ACTIVE" && (
                  <ActionButton onClick={() => setConfirmAction({ type: "suspend", user })} variant="warning">Suspend</ActionButton>
                )}
                {user.accountStatus === "SUSPENDED" && (
                  <ActionButton onClick={() => setConfirmAction({ type: "activate", user })} variant="success">Activate</ActionButton>
                )}
                <ActionButton onClick={() => setConfirmAction({ type: "delete", user })} variant="danger">Delete</ActionButton>
              </div>
            </Td>
          </TableRow>
        ))}
      </Table>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} onSubmit={provisionUser} />}

      {confirmAction?.type === "suspend" && <ConfirmDialog title="Suspend user?" message={`${displayName(confirmAction.user)} will lose access immediately.`} confirmLabel="Suspend" danger onConfirm={async () => { await suspendUser(confirmAction.user.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />}
      {confirmAction?.type === "activate" && <ConfirmDialog title="Reactivate user?" message={`${displayName(confirmAction.user)} will regain full access.`} confirmLabel="Activate" onConfirm={async () => { await activateUser(confirmAction.user.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />}
      {confirmAction?.type === "delete" && <ConfirmDialog title="Delete account?" message={`This will permanently delete ${displayName(confirmAction.user)}'s account.`} confirmLabel="Delete" danger onConfirm={async () => { await deleteUser(confirmAction.user.id); setConfirmAction(null); }} onCancel={() => setConfirmAction(null)} />}
    </div>
  );
}
