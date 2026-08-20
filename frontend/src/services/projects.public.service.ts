import { apiClient } from "./apiClient";
import type { PublicProject, PublicProjectDetail } from "../types/project";

//servicio aparte del de admin: distinto publico, distinto contrato
const BASE_PATH = "/projects";

export const getPublicProjects = (): Promise<PublicProject[]> => {
  return apiClient.get<PublicProject[]>(BASE_PATH);
};

export const getPublicProject = (
  slug: string
): Promise<PublicProjectDetail> => {
  return apiClient.get<PublicProjectDetail>(`${BASE_PATH}/${slug}`);
};
