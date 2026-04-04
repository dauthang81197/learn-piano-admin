"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { courseApi } from "@/lib/api/course";
import { CourseBasicInfoForm } from "@/components/course/CourseBasicInfoForm";
import { CourseLessonManager } from "@/components/course/CourseLessonManager";
import { CourseReview } from "@/components/course/CourseReview";
import type { Course } from "@/lib/types/course";

const STEPS = [
  { id: 1, name: "Basic Info", description: "Course details" },
  { id: 2, name: "Lessons", description: "Add & attach lessons" },
  { id: 3, name: "Review", description: "Review & finish" },
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const course = await courseApi.getById(courseId);
      setCourseData(course);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{error ?? "Course not found"}</p>
        <button onClick={() => router.push("/admin/courses")} className="text-blue-600 underline text-sm">
          Back to courses
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="mt-1 text-sm text-gray-500">{courseData.title}</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((step, idx) => (
            <li key={step.id} className={`relative ${idx !== STEPS.length - 1 ? "flex-1 pr-8 sm:pr-20" : ""}`}>
              {idx !== STEPS.length - 1 && (
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className={`h-0.5 w-full ${step.id < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                </div>
              )}
              <button type="button" onClick={() => setCurrentStep(step.id)} className="relative flex items-center">
                <span className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  step.id === currentStep ? "bg-blue-600 text-white" :
                  step.id < currentStep ? "bg-blue-600 text-white" :
                  "bg-white border-2 border-gray-300 text-gray-400"
                }`}>
                  {step.id < currentStep
                    ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    : step.id}
                </span>
                <span className="ml-3 flex flex-col text-left">
                  <span className={`text-sm font-medium ${step.id === currentStep ? "text-blue-600" : step.id < currentStep ? "text-gray-900" : "text-gray-400"}`}>{step.name}</span>
                  <span className="text-xs text-gray-400">{step.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {currentStep === 1 && (
          <CourseBasicInfoForm
            onSuccess={(updated) => { setCourseData(updated); setCurrentStep(2); }}
            initialData={courseData}
            isEdit
            courseId={courseId}
          />
        )}
        {currentStep === 2 && (
          <CourseLessonManager
            courseId={courseId}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <CourseReview
            course={courseData}
            courseId={courseId}
            onFinish={() => router.push("/admin/courses")}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
}

