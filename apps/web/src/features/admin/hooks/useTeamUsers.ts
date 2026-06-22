import { useState, useEffect, useCallback } from "react";
import { adminService, type TeamUser } from "../services/admin.service";

interface UseTeamUsersReturn {
  users: TeamUser[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  updateRole:   (id: string, role: string)   => Promise<void>;
}

export function useTeamUsers(params?: { role?: string; status?: string }): UseTeamUsersReturn {
  const [users,     setUsers]     = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const res = await adminService.getUsers(params);
      setUsers(res.data?.users ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [params?.role, params?.status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateStatus = async (id: string, status: string) => {
    await adminService.updateUserStatus(id, status);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, accountStatus: status } : u));
  };

  const updateRole = async (id: string, role: string) => {
    await adminService.updateUserRole(id, role);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  };

  return { users, isLoading, error, refetch: fetchUsers, updateStatus, updateRole };
}
