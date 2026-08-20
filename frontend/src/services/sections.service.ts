import { apiClient } from "./apiClient";
import type { Section, SectionInput } from "../types/section";

const BASE_PATH = "/admin/projects";
const SECTION_PATH = "/admin/sections";

export const getSections = (projectId: string): Promise<Section[]> => {
  return apiClient.get<Section[]>(`${BASE_PATH}/${projectId}/sections`);
};

export const createSection = (
  projectId: string,
  data: SectionInput
): Promise<Section> => {
  return apiClient.post<Section>(`${BASE_PATH}/${projectId}/sections`, data);
};

export const updateSection = (
  id: string,
  data: SectionInput
): Promise<Section> => {
  return apiClient.put<Section>(`${SECTION_PATH}/${id}`, data);
};

//el backend responde 204 sin cuerpo
export const deleteSection = async (id: string): Promise<void> => {
  await apiClient.delete(`${SECTION_PATH}/${id}`);
};

//el backend exige los ids completos del proyecto y devuelve la lista ya ordenada
export const reorderSections = (
  projectId: string,
  ids: string[]
): Promise<Section[]> => {
  return apiClient.put<Section[]>(`${BASE_PATH}/${projectId}/sections/reorder`, {
    ids,
  });
};
