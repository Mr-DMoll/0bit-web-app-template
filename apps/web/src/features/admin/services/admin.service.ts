import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

export type StaffRole = "MANAGER" | "DEVELOPER" | "CLIENT";

export interface TeamUser {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  async getUsersByRole(role: StaffRole): Promise<{ data: { users: TeamUser[] } }> {
    const { data } = await apiClient.get(endpoints.users.list, {
      params: { role },
    });
    return data;
  },

  async getAllTeamUsers(): Promise<{ data: { users: TeamUser[] } }> {
    const { data } = await apiClient.get(endpoints.users.list);
    return data;
  },

  async provisionUser(email: string, role: StaffRole) {
    const { data } = await apiClient.post(endpoints.users.provision, {
      email,
      role,
    });
    return data;
  },

  async resendInvite(email: string) {
    const { data } = await apiClient.post(endpoints.users.resendInvite, {
      email,
    });
    return data;
  },

  async suspendUser(id: string) {
    const { data } = await apiClient.patch(endpoints.users.status(id), {
      status: "SUSPENDED",
    });
    return data;
  },

  async activateUser(id: string) {
    const { data } = await apiClient.patch(endpoints.users.status(id), {
      status: "ACTIVE",
    });
    return data;
  },

  async deleteUser(id: string) {
    await apiClient.delete(endpoints.users.delete(id));
  },
};
