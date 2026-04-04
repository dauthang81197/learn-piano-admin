// ─── Course ──────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  isPremium: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
  thumbnail?: string;
  isPremium?: boolean;
  order?: number;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  isPremium?: boolean;
  order?: number;
}

// ─── Section ─────────────────────────────────────────────────────────────────
export interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSectionDto {
  title?: string;
  description?: string;
  orderIndex?: number;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────
export enum LessonType {
  VIDEO = "video",
  THEORY = "theory",
  ARTICLE = "article",
  QUIZ = "quiz",
  RESOURCE = "resource",
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  content?: string | null;
  xpReward?: number;
  isPremium?: boolean;
  isFree?: boolean;
  duration?: number;
  order?: number;
  orderIndex?: number;
  locked?: boolean;
  isCompleted?: boolean;
  videoUrl?: string;
  videoKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  xpReward?: number;
  isPremium?: boolean;
  isFree?: boolean;
  duration?: number;
  orderIndex?: number;
  courseId?: string;
  order: number;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  type?: LessonType;
  content?: string;
  xpReward?: number;
  isPremium?: boolean;
  isFree?: boolean;
  duration?: number;
  order?: number;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface CreateQuizQuestionDto {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface CreateQuizDto {
  lessonId: string;
  questions: CreateQuizQuestionDto[];
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────
export interface RoadmapLesson {
  id: string;
  title: string;
  type: string;
  order: number;
  xpReward: number;
  isPremium: boolean;
  locked: boolean;
  isCompleted: boolean;
  content: string | null;
}

export interface RoadmapResponse {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    isPremium: boolean;
    order: number;
  };
  lessons: RoadmapLesson[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

// ─── Video ────────────────────────────────────────────────────────────────────
export interface VideoUploadResponse {
  message: string;
  lessonId: string;
  fileName: string;
  size: number;
  mimeType: string;
}

export interface VideoUrlResponse {
  url: string;
}

