import apiClient from "./client";
import type { Quiz, CreateQuizDto } from "../types/course";

export const quizApi = {
  getByLesson: async (lessonId: string): Promise<Quiz> => {
    const response = await apiClient.get(`/quiz/${lessonId}`);
    return response.data;
  },

  create: async (data: CreateQuizDto): Promise<Quiz> => {
    const response = await apiClient.post("/quiz", data);
    return response.data;
  },

  update: async (lessonId: string, data: CreateQuizDto): Promise<Quiz> => {
    const response = await apiClient.put(`/quiz/${lessonId}`, data);
    return response.data;
  },
};

