"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { courseApi } from "@/lib/api/course";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Textarea } from "@/components/base/Textarea";
import type { CreateCourseDto, Course } from "@/lib/types/course";

interface CourseBasicInfoFormProps {
  onSuccess: (course: Course) => void;
  initialData?: Partial<Course>;
  isEdit?: boolean;
  courseId?: string;
}

export function CourseBasicInfoForm({ onSuccess, initialData, isEdit = false, courseId }: CourseBasicInfoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | undefined>(initialData?.thumbnail ?? undefined);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CreateCourseDto & { isPremium: boolean }>({
      defaultValues: {
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        thumbnail: initialData?.thumbnail ?? "",
        isPremium: initialData?.isPremium ?? false,
        order: initialData?.order ?? 0,
      },
    });

  const thumbnailValue = watch("thumbnail");

  const handleThumbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;
    try {
      setUploadingThumb(true);
      const result = await courseApi.uploadThumbnail(courseId, file);
      setValue("thumbnail", result.thumbnail);
      setThumbPreview(result.thumbnail);
    } catch {
      setError("Failed to upload thumbnail");
    } finally {
      setUploadingThumb(false);
    }
  };

  const onSubmit = async (data: CreateCourseDto & { isPremium: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      const payload: CreateCourseDto = {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail || undefined,
        isPremium: data.isPremium,
        order: Number(data.order) || 0,
      };
      const course =
        isEdit && courseId
          ? await courseApi.update(courseId, payload)
          : await courseApi.create(payload);
      onSuccess(course);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} course`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{isEdit ? "Edit Course" : "New Course"}</h2>
        <p className="text-gray-500 text-sm">Fill in the basic details of your course</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <Input
        label="Course Title"
        required
        {...register("title", { required: "Title is required" })}
        error={errors.title?.message}
        placeholder="e.g., Piano for Beginners"
      />

      <Textarea
        label="Description"
        required
        {...register("description", { required: "Description is required" })}
        error={errors.description?.message}
        placeholder="What will students learn in this course?"
        rows={4}
      />

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
        <div className="flex gap-4 items-start">
          {(thumbPreview || thumbnailValue) && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <Image
                src={thumbPreview || thumbnailValue || ""}
                alt="Thumbnail preview"
                fill
                className="object-cover"
                onError={() => setThumbPreview(undefined)}
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              label=""
              {...register("thumbnail")}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => { setValue("thumbnail", e.target.value); setThumbPreview(e.target.value); }}
            />
            {courseId && (
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploadingThumb ? "Uploading..." : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbFile} disabled={uploadingThumb} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Access</label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register("isPremium")} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-700">
              Premium course <span className="text-gray-400">(requires subscription)</span>
            </span>
          </label>
        </div>

        <Input
          label="Display Order"
          type="number"
          {...register("order", { valueAsNumber: true })}
          placeholder="0"
        />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit ? "Saving..." : "Creating..."
            : isEdit ? "Save & Continue" : "Create Course & Continue"}
        </Button>
      </div>
    </form>
  );
}

