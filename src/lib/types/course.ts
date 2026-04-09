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

// ─── Lesson Content Blocks ────────────────────────────────────────────────────
export enum ContentBlockType {
  TEXT = "text",
  VIDEO = "video",
  IMAGE = "image",
}

export interface LessonContent {
  id: string;
  lessonId: string;
  type: ContentBlockType;
  order: number;
  textData?: string | null;
  url?: string | null;
  duration?: number | null;
  caption?: string | null;
  altText?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonContentDto {
  type: ContentBlockType;
  order: number;
  textData?: string;
  url?: string;
  duration?: number;
  caption?: string;
  altText?: string;
}

// ─── Lesson ───────────────────────────────────────────────────────────────────
export enum LessonType {
  THEORY = "theory",
  QUIZ = "quiz",
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  contents: LessonContent[];
  xpReward?: number;
  isPremium?: boolean;
  order?: number;
  quizIds?: string[];
  locked?: boolean;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonDto {
  title: string;
  type: LessonType;
  contents: CreateLessonContentDto[];
  xpReward?: number;
  isPremium?: boolean;
  quizIds?: string[];
  courseId?: string;
  order: number;
}

export interface UpdateLessonDto {
  title?: string;
  type?: LessonType;
  contents?: CreateLessonContentDto[];
  xpReward?: number;
  isPremium?: boolean;
  quizIds?: string[];
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
  contents: LessonContent[];
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

