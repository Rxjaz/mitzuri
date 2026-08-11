import { apiClient } from "./apiClient";
import type { Project, ProjectInput } from "../types/project";

const BASE_PATH = "/admin/projects";

export const getProjects = (): Promise<Project[]> => {
  return apiClient.get<Project[]>(BASE_PATH);
};

export const getProject = (id: string): Promise<Project> => {
  return apiClient.get<Project>(`${BASE_PATH}/${id}`);
};

export const createProject = (data: ProjectInput): Promise<Project> => {
  return apiClient.post<Project>(BASE_PATH, data);
};

export const updateProject = (
  id: string,
  data: Partial<ProjectInput>
): Promise<Project> => {
  return apiClient.put<Project>(`${BASE_PATH}/${id}`, data);
};

//el backend responde 204 sin cuerpo
export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}/${id}`);
};

export const publishProject = (id: string): Promise<Project> => {
  return apiClient.post<Project>(`${BASE_PATH}/${id}/publish`);
};

export const unlistProject = (id: string): Promise<Project> => {
  return apiClient.post<Project>(`${BASE_PATH}/${id}/unlist`);
};

export const unpublishProject = (id: string): Promise<Project> => {
  return apiClient.post<Project>(`${BASE_PATH}/${id}/unpublish`);
};
