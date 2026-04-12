import apiClient from "./client";
import type { Lesson, CreateLessonDto, UpdateLessonDto, VideoUploadResponse, VideoUrlResponse } from "../types/course";

export const lessonApi = {
  getById: async (lessonId: string): Promise<Lesson> => {
    const response = await apiClient.get(`/admin/lessons/${lessonId}`);
    return response.data;
  },

  create: async (data: CreateLessonDto): Promise<Lesson> => {
    const response = await apiClient.post("/admin/lessons", data);
    return response.data;
  },

  update: async (id: string, data: UpdateLessonDto): Promise<Lesson> => {
    const response = await apiClient.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/lessons/${id}`);
  },

  uploadVideo: async (
    lessonId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/admin/lessons/${lessonId}/video`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data;
  },

  getVideoUrl: async (lessonId: string): Promise<string> => {
    const response = await apiClient.get<VideoUrlResponse>(`/lessons/${lessonId}/video-url`);
    return response.data.url;
  },
};

