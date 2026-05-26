"use client";

import { useState } from "react";
import { useTeamUsers } from "../hooks/useTeamUsers";
import type { TeamUser } from "../services/admin.service";

// ─── Reusable components ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:    "bg-green-500/10 text-green-400 border border-green-500/20",
    PENDING:   "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    SUSPENDED: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? styles.PENDING}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function AddUserModal({
  role,
  roleLabel,
  onClose,
  onSubmit,
}: {
  role: string;
  roleLabel: string;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(email.trim().toLowerCase());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? `Failed to add ${roleLabel}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add {roleLabel}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${roleLabel.toLowerCase()}@example.com`}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-colors text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <p className="text-xs text-slate-500">
            An activation email will be sent. They will set their own password.
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !email.trim()} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-900 bg-lime-400 rounded-lg hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string;
  confirmClass: string; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
          <button onClick={async () => { setIsLoading(true); await onConfirm(); setIsLoading(false); }} disabled={isLoading} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClass}`}>
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRow({
  user, onSuspend, onActivate, onDelete, onResend,
}: {
  user: TeamUser;
  onSuspend: (id: string) => Promise<void>;
  onActivate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResend: (email: string) => Promise<void>;
}) {
  const [confirm, setConfirm] = useState<"suspend" | "activate" | "delete" | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const displayName =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email;

  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend(user.email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lime-500/20 border border-lime-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-lime-400">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-none">{displayName}</p>
              {displayName !== user.email && <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5"><StatusBadge status={user.accountStatus} /></td>
        <td className="px-4 py-3.5 text-sm text-slate-400">
          {new Date(user.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            {user.accountStatus === "PENDING" && (
              <button onClick={handleResend} disabled={isResending} className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded hover:bg-slate-600 transition-colors disabled:opacity-50">
                {isResending ? "Sending..." : resendSuccess ? "✓ Sent" : "Resend invite"}
              </button>
            )}
            {user.accountStatus === "ACTIVE" && (
              <button onClick={() => setConfirm("suspend")} className="px-2.5 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded hover:bg-yellow-500/20 transition-colors">
                Suspend
              </button>
            )}
            {user.accountStatus === "SUSPENDED" && (
              <button onClick={() => setConfirm("activate")} className="px-2.5 py-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors">
                Activate
              </button>
            )}
            <button onClick={() => setConfirm("delete")} className="px-2.5 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors">
              Delete
            </button>
          </div>
        </td>
      </tr>

      {confirm === "suspend" && (
        <ConfirmDialog title="Suspend user?" message={`${displayName} will lose access immediately.`} confirmLabel="Suspend" confirmClass="text-white bg-yellow-600 hover:bg-yellow-500" onConfirm={async () => { await onSuspend(user.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />
      )}
      {confirm === "activate" && (
        <ConfirmDialog title="Reactivate user?" message={`${displayName} will regain full access.`} confirmLabel="Activate" confirmClass="text-slate-900 bg-lime-400 hover:bg-lime-300" onConfirm={async () => { await onActivate(user.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />
      )}
      {confirm === "delete" && (
        <ConfirmDialog title="Delete account?" message={`This will permanently delete ${displayName}'s account. This cannot be undone.`} confirmLabel="Delete" confirmClass="text-white bg-red-600 hover:bg-red-500" onConfirm={async () => { await onDelete(user.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />
      )}
    </>
  );
}

// ─── USERS TABLE ──────────────────────────────────────────────────────────────
function UsersTable({
  roleKey, roleLabel, canAdd,
}: {
  roleKey: "MANAGER" | "DEVELOPER" | "CLIENT";
  roleLabel: string;
  canAdd: boolean;
}) {
  const { users, isLoading, error, provisionUser, suspendUser, activateUser, deleteUser, resendInvite } =
    useTeamUsers(roleKey);
  const [showModal, setShowModal] = useState(false);

  const active    = users.filter((u) => u.accountStatus === "ACTIVE").length;
  const pending   = users.filter((u) => u.accountStatus === "PENDING").length;
  const suspended = users.filter((u) => u.accountStatus === "SUSPENDED").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">{roleLabel}s</h2>
          <div className="flex gap-2 text-xs">
            <span className="text-green-400">{active} active</span>
            {pending > 0 && <span className="text-yellow-400">{pending} pending</span>}
            {suspended > 0 && <span className="text-red-400">{suspended} suspended</span>}
          </div>
        </div>
        {canAdd && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-lime-400 rounded-lg hover:bg-lime-300 transition-colors"
          >
            <span>+</span> Add {roleLabel}
          </button>
        )}
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-lime-400 rounded-full animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-white mb-1">No {roleLabel.toLowerCase()}s yet</p>
            {canAdd && (
              <button onClick={() => setShowModal(true)} className="mt-3 px-4 py-2 text-sm font-semibold text-slate-900 bg-lime-400 rounded-lg hover:bg-lime-300 transition-colors">
                Add first {roleLabel.toLowerCase()}
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{roleLabel}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Added</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onSuspend={suspendUser}
                  onActivate={activateUser}
                  onDelete={deleteUser}
                  onResend={resendInvite}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AddUserModal
          role={roleKey}
          roleLabel={roleLabel}
          onClose={() => setShowModal(false)}
          onSubmit={(email) => provisionUser(email, roleKey)}
        />
      )}
    </div>
  );
}

// ─── MANAGERS PAGE ────────────────────────────────────────────────────────────
export function ManagersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Managers</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage project managers who oversee client delivery
        </p>
      </div>
      <UsersTable roleKey="MANAGER" roleLabel="Manager" canAdd={true} />
    </div>
  );
}
