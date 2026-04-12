import apiClient from "./client";
import type { Media } from "../types/course";

export const mediaApi = {
  // ── Read (authenticated user) ──────────────────────────────────────────────
  getAll: async (): Promise<Media[]> => {
    const response = await apiClient.get("/admin/media");
    return response.data;
  },

  getById: async (id: string): Promise<Media> => {
    const response = await apiClient.get(`/media/${id}`);
    return response.data;
  },

  // ── Admin mutations ────────────────────────────────────────────────────────
  upload: async (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Media> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/admin/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data;
  },

  getPresignedUrl: async (id: string, expiresIn = 3600): Promise<string> => {
    const response = await apiClient.get(`/admin/media/${id}/presigned-url`, {
      params: { expiresIn },
    });
    return (response.data as { url: string }).url;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/media/${id}`);
  },
};
