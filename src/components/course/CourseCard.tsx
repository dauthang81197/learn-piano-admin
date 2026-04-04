"use client";

import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/lib/types/course";

interface CourseCardProps {
  course: Course;
  onDelete?: (courseId: string) => void;
  isAdmin?: boolean;
}

export function CourseCard({ course, onDelete, isAdmin }: CourseCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(course.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {course.thumbnail ? (
          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-14 h-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {course.isPremium ? (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-400 text-yellow-900">⭐ Premium</span>
          ) : (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Free</span>
          )}
        </div>
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/40 text-white">
            #{course.order ?? 0}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{course.description}</p>

        {isAdmin ? (
          <div className="flex items-center gap-2 mt-4">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete course"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <Link
              href={`/courses/${course.id}`}
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

