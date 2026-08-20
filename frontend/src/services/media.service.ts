import { apiClient } from "./apiClient";
import type { MediaAsset } from "../types/media";

const BASE_PATH = "/admin/media";

export const uploadMedia = (
  file: File,
  altText?: string
): Promise<MediaAsset> => {
  const formData = new FormData();

  formData.append("file", file);

  if (altText) {
    formData.append("alt_text", altText);
  }

  return apiClient.upload<MediaAsset>(BASE_PATH, formData);
};
