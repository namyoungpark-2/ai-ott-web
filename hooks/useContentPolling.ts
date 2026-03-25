import { useEffect, useState } from "react";

export type ContentData = {
  id: string;
  title: string;
  status: "PROCESSING" | "READY" | "FAILED";
  streamUrl?: string | null;
  thumbnailUrl?: string | null;
  errorMessage?: string | null;
  videoWidth?: number | null;
  videoHeight?: number | null;
};

/**
 * Polls `/api/contents/:id` until the content reaches READY or FAILED status.
 * Handles 401/403/404 gracefully by surfacing user-friendly error states.
 */
export function useContentPolling(id: string | undefined) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    async function tick() {
      try {
        const res = await fetch(`/api/contents/${id}?lang=en`);

        if (res.status === 403 || res.status === 401) {
          if (!alive) return;
          setContent({
            id: id!,
            title: "재생 권한 없음",
            status: "FAILED",
            streamUrl: null,
            thumbnailUrl: null,
            errorMessage: "이 콘텐츠를 재생할 권한이 없습니다.",
          });
          return;
        }
        if (res.status === 404) {
          if (!alive) return;
          setContent({
            id: id!,
            title: "콘텐츠를 찾을 수 없음",
            status: "FAILED",
            streamUrl: null,
            thumbnailUrl: null,
            errorMessage: "요청한 콘텐츠를 찾을 수 없습니다.",
          });
          return;
        }
        if (!res.ok) {
          setTimeout(tick, 1500);
          return;
        }
        const data = await res.json();

        const normalized: ContentData = {
          id: data.id,
          title: data.title ?? "Untitled",
          status: data.status,
          streamUrl: data.streamUrl ?? null,
          thumbnailUrl: data.thumbnailUrl ?? null,
          errorMessage: data.errorMessage ?? null,
          videoWidth: data.videoWidth ?? null,
          videoHeight: data.videoHeight ?? null,
        };

        if (!alive) return;
        setContent(normalized);

        if (normalized.status === "READY") setIsReady(true);
        if (normalized.status === "PROCESSING") setTimeout(tick, 1500);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setTimeout(tick, 1500);
      }
    }

    tick();
    return () => {
      alive = false;
    };
  }, [id]);

  return { content, isReady };
}
