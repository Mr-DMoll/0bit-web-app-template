import apiClient from "@/api/client";
import { endpoints } from "@/api/endpoints";

export interface ProjectMember {
  id:       string;
  role:     string;
  joinedAt: string;
  user: {
    id:          string;
    firstName:   string | null;
    lastName:    string | null;
    displayName: string | null;
    email:       string;
    avatarUrl:   string | null;
    role:        string;
  };
}

export interface Project {
  id:           string;
  name:         string;
  description:  string | null;
  status:       string;
  budget:       string | null;
  spent:        string;
  currency:     string;
  startDate:    string | null;
  deadline:     string | null;
  completedAt:  string | null;
  repositoryUrl: string | null;
  liveSiteUrl:  string | null;
  figmaUrl:     string | null;
  createdAt:    string;
  updatedAt:    string;
  manager: {
    id: string; firstName: string | null; lastName: string | null;
    displayName: string | null; email: string; avatarUrl: string | null;
  };
  client: {
    id: string; firstName: string | null; lastName: string | null;
    displayName: string | null; email: string; avatarUrl: string | null;
  };
  members: ProjectMember[];
  _count: {
    milestones: number;
    tasks:      number;
    documents:  number;
    invoices:   number;
  };
}

export interface CreateProjectData {
  name:          string;
  description?:  string;
  clientId:      string;
  managerId?:    string;
  budget?:       number;
  currency?:     string;
  startDate?:    string;
  deadline?:     string;
  repositoryUrl?: string;
  liveSiteUrl?:  string;
  figmaUrl?:     string;
  intakeFormId?: string;
}

export const projectService = {
  async list(params?: { status?: string; search?: string }): Promise<{ data: { projects: Project[] } }> {
    const { data } = await apiClient.get(endpoints.projects.list, { params });
    return data;
  },

  async getById(id: string): Promise<{ data: { project: Project } }> {
    const { data } = await apiClient.get(endpoints.projects.byId(id));
    return data;
  },

  async create(payload: CreateProjectData): Promise<{ data: { project: Project } }> {
    const { data } = await apiClient.post(endpoints.projects.create, payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateProjectData>): Promise<{ data: { project: Project } }> {
    const { data } = await apiClient.patch(endpoints.projects.update(id), payload);
    return data;
  },

  async updateStatus(id: string, status: string): Promise<{ data: { project: Project } }> {
    const { data } = await apiClient.patch(endpoints.projects.status(id), { status });
    return data;
  },

  async addMember(projectId: string, userId: string, role?: string) {
    const { data } = await apiClient.post(endpoints.projects.addMember(projectId), { userId, role });
    return data;
  },

  async removeMember(projectId: string, userId: string) {
    await apiClient.delete(endpoints.projects.removeMember(projectId, userId));
  },

  async delete(id: string) {
    await apiClient.delete(endpoints.projects.delete(id));
  },
};
