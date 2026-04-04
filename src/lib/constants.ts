export const SITE_CONFIG = {
  name: "CoursUE Admin",
  description: "Admin dashboard for CoursUE platform",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_COURSES_NEW: "/admin/courses/new",
  ADMIN_COURSE_EDIT: (id: string) => `/admin/courses/${id}/edit`,
} as const;

