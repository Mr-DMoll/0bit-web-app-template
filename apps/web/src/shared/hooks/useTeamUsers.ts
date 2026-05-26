import { useState, useEffect, useCallback } from "react";
import { adminService, type TeamUser, type StaffRole } from   "../../features/admin/services/admin.service" //"@/shared/services/admin.service";

interface UseTeamUsersReturn {
  users: TeamUser[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  provisionUser: (email: string, role: StaffRole) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resendInvite: (email: string) => Promise<void>;
}

export function useTeamUsers(filterRole?: StaffRole): UseTeamUsersReturn {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = filterRole
        ? await adminService.getUsersByRole(filterRole)
        : await adminService.getAllTeamUsers();
      setUsers(response.data?.users ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const provisionUser = async (email: string, role: StaffRole) => {
    await adminService.provisionUser(email, role);
    await fetchUsers();
  };

  const suspendUser = async (id: string) => {
    await adminService.suspendUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, accountStatus: "SUSPENDED" } : u)),
    );
  };

  const activateUser = async (id: string) => {
    await adminService.activateUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, accountStatus: "ACTIVE" } : u)),
    );
  };

  const deleteUser = async (id: string) => {
    await adminService.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resendInvite = async (email: string) => {
    await adminService.resendInvite(email);
  };

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    provisionUser,
    suspendUser,
    activateUser,
    deleteUser,
    resendInvite,
  };
}
