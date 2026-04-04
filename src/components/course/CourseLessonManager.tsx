"use client";

import { useState, useEffect, useCallback } from "react";
import { courseApi } from "@/lib/api/course";
import { lessonApi } from "@/lib/api/lesson";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Textarea } from "@/components/base/Textarea";
import type { RoadmapLesson, Lesson, LessonType } from "@/lib/types/course";

interface CourseLessonManagerProps {
  courseId: string;
  onNext: () => void;
  onBack: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  theory: "bg-indigo-100 text-indigo-700",
  video: "bg-blue-100 text-blue-700",
  quiz: "bg-orange-100 text-orange-700",
  article: "bg-green-100 text-green-700",
  resource: "bg-gray-100 text-gray-600",
};

type ModalMode = "create" | "attach" | null;

export function CourseLessonManager({ courseId, onNext, onBack }: CourseLessonManagerProps) {
  const [lessons, setLessons] = useState<RoadmapLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "theory" as LessonType,
    content: "",
    xpReward: 10,
    isPremium: false,
    duration: 0,
    order: 0,
  });

  const [attachId, setAttachId] = useState("");

  const loadRoadmap = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseApi.getRoadmap(courseId);
      setLessons(data.lessons ?? []);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadRoadmap(); }, [loadRoadmap]);

  const handleCreate = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    try {
      setSaving(true); setError(null);
      const created: Lesson = await lessonApi.create({
        courseId,
        order: Number(form.order),
        title: form.title,
        type: form.type,
        content: form.content || undefined,
        xpReward: form.xpReward,
        isPremium: form.isPremium,
        duration: form.duration || undefined,
      });
      await courseApi.attachLesson(courseId, created.id);
      setModal(null);
      setForm({ title: "", type: "theory" as LessonType, content: "", xpReward: 10, isPremium: false, duration: 0, order: 0 });
      await loadRoadmap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create lesson");
    } finally { setSaving(false); }
  };

  const handleAttach = async () => {
    if (!attachId.trim()) { setError("Lesson ID is required"); return; }
    try {
      setSaving(true); setError(null);
      await courseApi.attachLesson(courseId, attachId.trim());
      setModal(null); setAttachId("");
      await loadRoadmap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to attach lesson");
    } finally { setSaving(false); }
  };

  const handleDetach = async (lessonId: string, title: string) => {
    if (!confirm(`Remove "${title}" from this course?`)) return;
    try {
      await courseApi.detachLesson(courseId, lessonId);
      await loadRoadmap();
    } catch {
      alert("Failed to remove lesson");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Lessons</h2>
          <p className="text-gray-500 text-sm">Add lessons to this course.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setModal("attach"); setError(null); }}>
            Attach Existing
          </Button>
          <Button onClick={() => { setModal("create"); setError(null); }}>
            + New Lesson
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">🎵</div>
          <p className="text-gray-500 font-medium">No lessons yet</p>
          <p className="text-gray-400 text-sm mt-1">Create a new lesson or attach an existing one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 truncate">{lesson.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[lesson.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {lesson.type}
                  </span>
                  {lesson.isPremium && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">⭐ Premium</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>🏆 {lesson.xpReward} XP</span>
                  {lesson.locked && <span>🔒 Locked</span>}
                </div>
              </div>
              <button
                onClick={() => handleDetach(lesson.id, lesson.title)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove from course"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={lessons.length === 0}>
          Continue to Review ({lessons.length} lesson{lessons.length !== 1 ? "s" : ""}) →
        </Button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === "create" ? "Create New Lesson" : "Attach Existing Lesson"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              {modal === "create" ? (
                <>
                  <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Introduction to Piano" />
                  <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Brief description..." rows={2} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="theory">Theory</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                        <option value="article">Article</option>
                        <option value="resource">Resource</option>
                      </select>
                    </div>
                    <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })} placeholder="10" />
                  </div>
                  <Input label="Display Order *" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Premium lesson</span>
                  </label>
                  <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating..." : "Create & Attach"}</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Enter the ID of a lesson you have already created to attach it to this course.</p>
                  <Input label="Lesson ID" value={attachId} onChange={(e) => setAttachId(e.target.value)} placeholder="uuid of the lesson" />
                  <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                    <Button onClick={handleAttach} disabled={saving}>{saving ? "Attaching..." : "Attach"}</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

