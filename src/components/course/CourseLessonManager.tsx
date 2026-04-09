"use client";

import { useState, useEffect, useCallback } from "react";
import { courseApi } from "@/lib/api/course";
import { lessonApi } from "@/lib/api/lesson";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Textarea } from "@/components/base/Textarea";
import type {
  RoadmapLesson,
  Lesson,
  LessonType,
  CreateLessonContentDto,
  ContentBlockType,
} from "@/lib/types/course";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  theory: "bg-indigo-100 text-indigo-700",
  quiz: "bg-orange-100 text-orange-700",
};

const BLOCK_COLORS: Record<string, string> = {
  text: "border-l-indigo-400 bg-indigo-50/40",
  video: "border-l-blue-400 bg-blue-50/40",
  image: "border-l-green-400 bg-green-50/40",
};

const BLOCK_ICONS: Record<string, string> = {
  text: "T",
  video: "▶",
  image: "🖼",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseLessonManagerProps {
  courseId: string;
  onNext: () => void;
  onBack: () => void;
}

type ModalMode = "create" | "edit" | "attach" | null;

interface LessonForm {
  title: string;
  type: LessonType;
  xpReward: number;
  isPremium: boolean;
  order: number;
}

const emptyForm = (): LessonForm => ({
  title: "",
  type: "theory" as LessonType,
  xpReward: 10,
  isPremium: false,
  order: 0,
});

const emptyBlock = (type: ContentBlockType, order: number): CreateLessonContentDto => ({
  type,
  order,
  textData: type === "text" ? "" : undefined,
  url: type !== "text" ? "" : undefined,
  duration: type === "video" ? undefined : undefined,
  caption: type === "image" ? "" : undefined,
  altText: type === "image" ? "" : undefined,
});

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: CreateLessonContentDto;
  index: number;
  total: number;
  onChange: (field: keyof CreateLessonContentDto, value: string | number) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className={`border border-l-4 rounded-xl p-4 space-y-3 ${BLOCK_COLORS[block.type] ?? "bg-gray-50"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-bold">
            {BLOCK_ICONS[block.type]}
          </span>
          <span className="text-sm font-semibold text-gray-700 capitalize">{block.type} Block</span>
          <span className="text-xs text-gray-400">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Remove block"
          >
            ✕
          </button>
        </div>
      </div>

      {block.type === "text" && (
        <Textarea
          label="Nội dung"
          value={block.textData ?? ""}
          onChange={(e) => onChange("textData", e.target.value)}
          placeholder="Nhập nội dung văn bản (hỗ trợ HTML)..."
          rows={4}
        />
      )}

      {block.type === "video" && (
        <div className="space-y-3">
          <Input
            label="URL Video *"
            value={block.url ?? ""}
            onChange={(e) => onChange("url", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Thời lượng (giây)"
            type="number"
            value={block.duration ?? ""}
            onChange={(e) => onChange("duration", Number(e.target.value))}
            placeholder="120"
          />
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-3">
          <Input
            label="URL Ảnh *"
            value={block.url ?? ""}
            onChange={(e) => onChange("url", e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Caption"
            value={block.caption ?? ""}
            onChange={(e) => onChange("caption", e.target.value)}
            placeholder="Chú thích ảnh..."
          />
          <Input
            label="Alt Text"
            value={block.altText ?? ""}
            onChange={(e) => onChange("altText", e.target.value)}
            placeholder="Mô tả ảnh cho screen reader..."
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CourseLessonManager({ courseId, onNext, onBack }: CourseLessonManagerProps) {
  const [lessons, setLessons] = useState<RoadmapLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm());
  const [blocks, setBlocks] = useState<CreateLessonContentDto[]>([]);
  const [attachId, setAttachId] = useState("");

  // ── Data loading ────────────────────────────────────────────────────────────

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

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm());
    setBlocks([]);
    setError(null);
    setModal("create");
  };

  const openEdit = async (lessonId: string) => {
    try {
      setError(null);
      const lesson = await lessonApi.getById(lessonId);
      setEditingLesson(lesson);
      setForm({
        title: lesson.title,
        type: lesson.type,
        xpReward: lesson.xpReward ?? 10,
        isPremium: lesson.isPremium ?? false,
        order: lesson.order ?? 0,
      });
      setBlocks(
        (lesson.contents ?? []).map((c) => ({
          type: c.type,
          order: c.order,
          textData: c.textData ?? undefined,
          url: c.url ?? undefined,
          duration: c.duration ?? undefined,
          caption: c.caption ?? undefined,
          altText: c.altText ?? undefined,
        }))
      );
      setModal("edit");
    } catch {
      alert("Không thể tải dữ liệu bài học");
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditingLesson(null);
    setForm(emptyForm());
    setBlocks([]);
    setError(null);
    setAttachId("");
  };

  // ── Blocks management ───────────────────────────────────────────────────────

  const addBlock = (type: ContentBlockType) => {
    setBlocks((prev) => [...prev, emptyBlock(type, prev.length)]);
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i })));
  };

  const updateBlock = (index: number, field: keyof CreateLessonContentDto, value: string | number) => {
    setBlocks((prev) => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= blocks.length) return;
    setBlocks((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr.map((b, i) => ({ ...b, order: i }));
    });
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title.trim()) { setError("Tiêu đề là bắt buộc"); return; }
    try {
      setSaving(true); setError(null);
      const created = await lessonApi.create({
        courseId,
        order: Number(form.order),
        title: form.title,
        type: form.type,
        xpReward: form.xpReward,
        isPremium: form.isPremium,
        contents: blocks.map((b, i) => ({ ...b, order: i })),
      });
      await courseApi.attachLesson(courseId, created.id);
      closeModal();
      await loadRoadmap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo bài học thất bại");
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!form.title.trim()) { setError("Tiêu đề là bắt buộc"); return; }
    if (!editingLesson) return;
    try {
      setSaving(true); setError(null);
      await lessonApi.update(editingLesson.id, {
        title: form.title,
        type: form.type,
        xpReward: form.xpReward,
        isPremium: form.isPremium,
        order: Number(form.order),
        contents: blocks.map((b, i) => ({ ...b, order: i })),
      });
      closeModal();
      await loadRoadmap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật bài học thất bại");
    } finally { setSaving(false); }
  };

  const handleAttach = async () => {
    if (!attachId.trim()) { setError("Lesson ID là bắt buộc"); return; }
    try {
      setSaving(true); setError(null);
      await courseApi.attachLesson(courseId, attachId.trim());
      closeModal();
      await loadRoadmap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Attach thất bại");
    } finally { setSaving(false); }
  };

  const handleDetach = async (lessonId: string, title: string) => {
    if (!confirm(`Xóa "${title}" khỏi khóa học này?`)) return;
    try {
      await courseApi.detachLesson(courseId, lessonId);
      await loadRoadmap();
    } catch {
      alert("Xóa bài học thất bại");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const isCreateOrEdit = modal === "create" || modal === "edit";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bài học</h2>
          <p className="text-gray-500 text-sm">Thêm và quản lý nội dung bài học trong khóa học.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setModal("attach"); setError(null); }}>
            Gắn bài có sẵn
          </Button>
          <Button onClick={openCreate}>+ Tạo bài học</Button>
        </div>
      </div>

      {/* Lesson list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">🎵</div>
          <p className="text-gray-500 font-medium">Chưa có bài học nào</p>
          <p className="text-gray-400 text-sm mt-1">Tạo bài học mới hoặc gắn bài học đã có.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-sm transition"
            >
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
                  {(lesson.contents?.length ?? 0) > 0 && (
                    <span>
                      {lesson.contents.filter((c) => c.type === "text").length > 0 && "📝 "}
                      {lesson.contents.filter((c) => c.type === "video").length > 0 && "▶ "}
                      {lesson.contents.filter((c) => c.type === "image").length > 0 && "🖼 "}
                      {lesson.contents.length} block{lesson.contents.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {lesson.locked && <span>🔒 Locked</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(lesson.id)}
                  className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Chỉnh sửa bài học"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDetach(lesson.id, lesson.title)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Xóa khỏi khóa học"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer nav */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>← Quay lại</Button>
        <Button onClick={onNext} disabled={lessons.length === 0}>
          Tiếp tục xem lại ({lessons.length} bài học) →
        </Button>
      </div>

      {/* ── Modal: Create / Edit ───────────────────────────────────────────── */}
      {isCreateOrEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === "create" ? "Tạo bài học mới" : `Chỉnh sửa: ${editingLesson?.title}`}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              {/* Basic info */}
              <div className="space-y-4">
                <Input
                  label="Tiêu đề *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Giới thiệu về nốt Đô"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài học</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="theory">Theory (Lý thuyết)</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <Input
                    label="XP Reward"
                    type="number"
                    value={form.xpReward}
                    onChange={(e) => setForm({ ...form, xpReward: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <Input
                    label="Thứ tự hiển thị *"
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Bài học Premium</span>
                  </label>
                </div>
              </div>

              {/* Content blocks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Nội dung ({blocks.length} block{blocks.length !== 1 ? "s" : ""})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addBlock("text" as ContentBlockType)}
                      className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                    >
                      + Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("video" as ContentBlockType)}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                    >
                      + Video
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("image" as ContentBlockType)}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition"
                    >
                      + Ảnh
                    </button>
                  </div>
                </div>

                {blocks.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                    Chưa có nội dung. Nhấn &quot;+ Text&quot;, &quot;+ Video&quot; hoặc &quot;+ Ảnh&quot; để thêm block.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blocks.map((block, index) => (
                      <BlockEditor
                        key={index}
                        block={block}
                        index={index}
                        total={blocks.length}
                        onChange={(field, value) => updateBlock(index, field, value)}
                        onRemove={() => removeBlock(index)}
                        onMoveUp={() => moveBlock(index, -1)}
                        onMoveDown={() => moveBlock(index, 1)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0">
              <Button variant="outline" onClick={closeModal}>Hủy</Button>
              <Button
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={saving}
              >
                {saving
                  ? modal === "create" ? "Đang tạo..." : "Đang lưu..."
                  : modal === "create" ? "Tạo & Gắn vào khóa học" : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Attach ──────────────────────────────────────────────────── */}
      {modal === "attach" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Gắn bài học có sẵn</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <p className="text-sm text-gray-500">Nhập ID của bài học đã tạo để gắn vào khóa học này.</p>
              <Input
                label="Lesson ID"
                value={attachId}
                onChange={(e) => setAttachId(e.target.value)}
                placeholder="uuid của bài học"
              />
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button variant="outline" onClick={closeModal}>Hủy</Button>
                <Button onClick={handleAttach} disabled={saving}>{saving ? "Đang gắn..." : "Gắn vào khóa học"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
