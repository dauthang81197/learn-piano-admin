"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { mediaApi } from "@/lib/api/media";
import { Button } from "@/components/base/Button";
import { AuthImage } from "@/components/base/AuthImage";
import type { Media, MediaType } from "@/lib/types/course";

type Filter = "all" | "image" | "video";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onUploaded }: { onUploaded: (media: Media) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const media = await mediaApi.upload(file, setProgress);
      onUploaded(media);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    upload(files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300 bg-white"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 font-medium">Đang upload... {progress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-3">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Kéo thả file vào đây</p>
          <p className="text-xs text-gray-400 mt-1">hoặc</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-sm text-blue-600 hover:underline font-medium"
          >
            Chọn file từ máy tính
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Hỗ trợ: JPG, PNG, WebP, GIF (≤10MB) · MP4, WebM, MOV (≤500MB)
          </p>
        </>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── Media Card (Image) ───────────────────────────────────────────────────────

function ImageCard({ media, onDelete }: { media: Media; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="relative aspect-video bg-gray-100">
        <AuthImage
            mediaId={media.id}
            alt={media.originalName}
            className="w-full h-full object-cover"
            fallback={<div className="w-full h-full animate-pulse bg-gray-200" />}
          />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={copyUrl}
            className="p-2 bg-white rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-xs font-medium"
            title="Copy URL"
          >
            {copied ? "✓" : "🔗"}
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            title="Xóa"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-gray-800 truncate" title={media.originalName}>
          {media.originalName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatBytes(media.size)} · {media.createdAt ? formatDate(media.createdAt) : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Video Player Modal ───────────────────────────────────────────────────────

function VideoPlayerModal({ media, onClose }: { media: Media; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mediaApi
      .getPresignedUrl(media.id)
      .then((url) => { setSrc(url); setLoading(false); })
      .catch(() => { setError("Không thể tải video"); setLoading(false); });
  }, [media.id]);

  // Đóng bằng ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
          <p className="text-sm font-medium text-white truncate">{media.originalName}</p>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
              <span className="text-sm text-gray-400">Đang tải...</span>
            </div>
          )}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          {src && (
            <video
              src={src}
              controls
              autoPlay
              className="w-full h-full"
              onError={() => setError("Không thể phát video này")}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-900 flex items-center gap-4 text-xs text-gray-400">
          <span>{media.mimeType}</span>
          <span>{formatBytes(media.size)}</span>
          {media.createdAt && <span>{formatDate(media.createdAt)}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Media Row (Video) ────────────────────────────────────────────────────────

function VideoRow({ media, onDelete }: { media: Media; onDelete: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition group">
        {/* Play button */}
        <button
          onClick={() => setShowPlayer(true)}
          className="w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center shrink-0 transition"
          title="Xem video"
        >
          <svg className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{media.originalName}</p>
          <p className="text-xs text-gray-400">
            {media.mimeType} · {formatBytes(media.size)}
            {media.createdAt ? ` · ${formatDate(media.createdAt)}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={copyUrl}
            className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
            title="Copy URL"
          >
            {copied ? "✓ Copied" : "🔗 URL"}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Xóa"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {showPlayer && (
        <VideoPlayerModal media={media} onClose={() => setShowPlayer(false)} />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mediaApi.getAll();
      setMediaList(data);
    } catch {
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa "${name}"?\nFile sẽ bị xóa khỏi R2 và database.`)) return;
    try {
      await mediaApi.remove(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xóa thất bại");
    }
  };

  const handleUploaded = (media: Media) => {
    setMediaList((prev) => [media, ...prev]);
    setShowUpload(false);
  };

  const filtered = mediaList.filter((m) => filter === "all" || m.type === (filter as MediaType));
  const images = filtered.filter((m) => m.type === "image");
  const videos = filtered.filter((m) => m.type === "video");

  const counts = {
    all: mediaList.length,
    image: mediaList.filter((m) => m.type === "image").length,
    video: mediaList.filter((m) => m.type === "video").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý ảnh và video trên Cloudflare R2 · {mediaList.length} file
          </p>
        </div>
        <Button onClick={() => setShowUpload((v) => !v)}>
          {showUpload ? "✕ Đóng" : "↑ Upload"}
        </Button>
      </div>

      {/* Upload zone */}
      {showUpload && <UploadZone onUploaded={handleUploaded} />}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["all", "image", "video"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "all" ? "Tất cả" : f === "image" ? "🖼 Ảnh" : "▶ Video"}
            <span className="ml-1.5 text-xs text-gray-400">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">🗂</div>
          <p className="text-gray-500 font-medium">Chưa có file nào</p>
          <p className="text-gray-400 text-sm mt-1">Upload ảnh hoặc video để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Images grid */}
          {images.length > 0 && (
            <div>
              {filter === "all" && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Ảnh · {images.length}
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((m) => (
                  <ImageCard
                    key={m.id}
                    media={m}
                    onDelete={() => handleDelete(m.id, m.originalName)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos list */}
          {videos.length > 0 && (
            <div>
              {filter === "all" && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Video · {videos.length}
                </h2>
              )}
              <div className="space-y-2">
                {videos.map((m) => (
                  <VideoRow
                    key={m.id}
                    media={m}
                    onDelete={() => handleDelete(m.id, m.originalName)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
