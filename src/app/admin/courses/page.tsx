"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { courseApi } from "@/lib/api/course";
import { Button } from "@/components/base/Button";
import { CourseCard } from "@/components/course/CourseCard";
import type { Course } from "@/lib/types/course";
import type { PaginationParams } from "@/lib/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  const loadCourses = async (params?: PaginationParams) => {
    try {
      setLoading(true);
      const response = await courseApi.getAll(params);
      setCourses(response.data);
      setPagination({ total: response.total, page: response.page, limit: response.limit });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseApi.delete(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{error}</p>
        <button onClick={() => loadCourses()} className="text-blue-600 underline text-sm">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your course catalog</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>Create Course</Button>
        </Link>
      </div>

      {courses?.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
          <div className="mt-6">
            <Link href="/admin/courses/new">
              <Button>Create Course</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onDelete={handleDelete} isAdmin />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {" "}to{" "}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {" "}of{" "}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => loadCourses({ page: pagination.page - 1, limit: pagination.limit })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  onClick={() => loadCourses({ page: pagination.page + 1, limit: pagination.limit })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

