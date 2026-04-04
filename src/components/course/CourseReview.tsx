"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { courseApi } from "@/lib/api/course";
import { Button } from "@/components/base/Button";
import type { Course, RoadmapLesson } from "@/lib/types/course";

interface CourseReviewProps {
  course: Partial<Course>;
  courseId?: string;
  onFinish: () => void;
  onBack: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  theory: "bg-indigo-100 text-indigo-700",
  video: "bg-blue-100 text-blue-700",
  quiz: "bg-orange-100 text-orange-700",
  article: "bg-green-100 text-green-700",
  resource: "bg-gray-100 text-gray-600",
};

export function CourseReview({ course, courseId, onFinish, onBack }: CourseReviewProps) {
  const [lessons, setLessons] = useState<RoadmapLesson[]>([]);
  const [loading, setLoading] = useState(false);

  const id = courseId ?? (course as Course)?.id;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getRoadmap(id);
        setLessons(data.lessons ?? []);
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Review & Finish</h2>
        <p className="text-gray-500 text-sm">Check everything looks good before saving.</p>
      </div>

      {/* Course info card */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex gap-6">
        {course.thumbnail && (
          <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
            <Image src={course.thumbnail} alt={course.title ?? ""} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
            {course.isPremium ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">⭐ Premium</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Free</span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
          <div className="mt-2 text-xs text-gray-400">
            Display order: <span className="font-semibold text-gray-600">{course.order ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Lessons{!loading && <span className="text-gray-400 font-normal"> ({lessons.length})</span>}
        </h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading lessons…</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
            No lessons attached yet
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium text-gray-800 flex-1 truncate">{lesson.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[lesson.type] ?? "bg-gray-100 text-gray-600"}`}>
                  {lesson.type}
                </span>
                <span className="text-xs text-gray-400">🏆 {lesson.xpReward} XP</span>
                {lesson.isPremium && <span className="text-xs text-yellow-600">⭐</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onFinish}>✓ Done</Button>
      </div>
    </div>
  );
}

