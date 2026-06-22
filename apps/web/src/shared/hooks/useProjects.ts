import { useState, useEffect, useCallback } from "react";
import { projectService, type Project, type CreateProjectData } from "../services/project.service";

interface UseProjectsReturn {
  projects:      Project[];
  isLoading:     boolean;
  error:         string | null;
  refetch:       () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateStatus:  (id: string, status: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export function useProjects(filters?: { status?: string; search?: string }): UseProjectsReturn {
  const [projects,  setProjects]  = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.list(filters);
      setProjects(response.data?.projects ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status, filters?.search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    const response = await projectService.create(data);
    await fetchProjects();
    return response.data.project;
  };

  const updateStatus = async (id: string, status: string) => {
    await projectService.updateStatus(id, status);
    setProjects((prev) =>
      prev.map((p) => p.id === id ? { ...p, status } : p),
    );
  };

  const deleteProject = async (id: string) => {
    await projectService.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, isLoading, error, refetch: fetchProjects, createProject, updateStatus, deleteProject };
}

// ─── Single project hook ──────────────────────────────────────────────────────
export function useProject(id: string) {
  const [project,   setProject]   = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.getById(id);
      setProject(response.data?.project ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load project.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  return { project, isLoading, error, refetch: fetchProject, setProject };
}
