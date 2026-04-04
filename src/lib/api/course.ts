import apiClient from "./client";
import type { Course, CreateCourseDto, UpdateCourseDto, RoadmapResponse } from "../types/course";
import type { PaginatedResponse, PaginationParams } from "../types";

export const courseApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get("/courses", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data: CreateCourseDto): Promise<Course> => {
    const response = await apiClient.post("/courses", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCourseDto): Promise<Course> => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  getRoadmap: async (courseId: string): Promise<RoadmapResponse> => {
    const response = await apiClient.get(`/courses/${courseId}/roadmap`);
    return response.data;
  },

  attachLesson: async (courseId: string, lessonId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/lessons/${lessonId}`);
  },

  detachLesson: async (courseId: string, lessonId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/lessons/${lessonId}`);
  },

  uploadThumbnail: async (
    courseId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ thumbnail: string; message: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/courses/${courseId}/thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data;
  },
};

