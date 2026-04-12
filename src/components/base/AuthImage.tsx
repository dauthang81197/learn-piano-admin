"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";

interface AuthImageProps {
  mediaId: string;
  alt: string;
  className?: string;
  /** Render khi đang load */
  fallback?: React.ReactNode;
}

/**
 * Fetch ảnh/video thumbnail qua stream API (có Bearer token),
 * tạo blob URL và inject vào <img>.
 * Tự revoke URL khi unmount.
 */
export function AuthImage({ mediaId, alt, className, fallback }: AuthImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;
    let cancelled = false;

    apiClient
      .get(`/admin/media/${mediaId}/stream`, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data as Blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId]);

  if (!src) {
    return (
      <>
        {fallback ?? (
          <div className={`animate-pulse bg-gray-200 ${className ?? ""}`} />
        )}
      </>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}
