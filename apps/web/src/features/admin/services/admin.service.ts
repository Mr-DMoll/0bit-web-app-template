import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

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
  async getDashboard() {
    const { data } = await apiClient.get(endpoints.admin.dashboard);
    return data;
  },

  async getManagers(): Promise<{ data: { managers: TeamUser[] } }> {
    const { data } = await apiClient.get(endpoints.admin.managers);
    return data;
  },

  async inviteUser(email: string) {
    const { data } = await apiClient.post(endpoints.admin.userInvite, { email });
    return data;
  },

  async inviteManager(email: string) {
    const { data } = await apiClient.post(endpoints.admin.managerInvite, { email });
    return data;
  },

  async getUsers(params?: { role?: string; status?: string; page?: number }) {
    const { data } = await apiClient.get(endpoints.admin.users, { params });
    return data;
  },

  async updateUserStatus(id: string, status: string) {
    const { data } = await apiClient.patch(endpoints.admin.userStatus(id), { status });
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { data } = await apiClient.patch(endpoints.admin.userRole(id), { role });
    return data;
  },
};
