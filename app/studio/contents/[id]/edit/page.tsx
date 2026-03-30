"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudioLayout from "@/components/studio/StudioLayout";
import { ContentForm, type ContentFormData } from "@/components/studio/ContentForm";
import { StatusBadge, VideoStatusBadge } from "@/components/studio/StatusBadge";
import ConfirmDialog from "@/components/studio/ConfirmDialog";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorContent, ContentStatus } from "@/types/channel";
import { InlinePlayer } from "@/components/studio/VideoPreview";

// ─── Styles ──────────────────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r)",
  padding: 24,
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text)",
};

const statusBtnBase: React.CSSProperties = {
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: "var(--r-sm)",
  cursor: "pointer",
  border: "1px solid var(--line)",
  background: "var(--bg2)",
  color: "var(--muted)",
};

// ─── Inner component ─────────────────────────────────────────────────────────

function ContentEditContent() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const id = params.id as string;

  const [content, setContent] = useState<CreatorContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  // ── Fetch content ────────────────────────────────────────────────────────

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/creator/contents?lang=${encodeURIComponent(locale)}&limit=100`,
        { credentials: "include" },
      );
      if (!res.ok) {
        setError("콘텐츠 목록을 불러올 수 없습니다.");
        return;
      }
      const data = await res.json();
      const items: CreatorContent[] = Array.isArray(data)
        ? data
        : data.items ?? [];
      const found = items.find((c) => c.contentId === id);
      if (found) {
        setContent(found);
      } else {
        setContent(null);
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, locale]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // ── Toast auto-dismiss ───────────────────────────────────────────────────

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── Status change ────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus: ContentStatus) => {
    if (statusChanging) return;
    setStatusChanging(true);
    try {
      const res = await fetch(
        `/api/creator/contents/${id}/status?status=${encodeURIComponent(newStatus)}`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) {
        setToast("상태 변경에 실패했습니다.");
        return;
      }
      await fetchContent();
      setToast("상태가 변경되었습니다.");
    } catch {
      setToast("서버 연결에 실패했습니다.");
    } finally {
      setStatusChanging(false);
    }
  };

  // ── Save metadata ────────────────────────────────────────────────────────

  const handleSubmit = async (data: ContentFormData) => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/creator/contents/${id}/metadata`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          lang: locale,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setFormError(body?.message ?? "저장에 실패했습니다.");
        return;
      }
      await fetchContent();
      setToast("저장되었습니다.");
    } catch {
      setFormError("서버 연결에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/creator/contents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setToast("삭제에 실패했습니다.");
        return;
      }
      router.push("/studio/contents");
    } catch {
      setToast("서버 연결에 실패했습니다.");
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
        불러오는 중...
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────

  if (!content) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 0 16px" }}>
          콘텐츠를 찾을 수 없습니다.
        </p>
        <a
          href="/studio/contents"
          style={{ color: "var(--accent)", fontSize: 14, textDecoration: "underline" }}
        >
          콘텐츠 목록으로 돌아가기
        </a>
      </div>
    );
  }

  // ── Determine available status transitions ───────────────────────────────

  const statusTransitions: { label: string; value: ContentStatus }[] = [];
  if (content.status === "PUBLISHED") {
    statusTransitions.push({ label: "비공개로 전환", value: "UNLISTED" });
  } else if (content.status === "UNLISTED" || content.status === "DRAFT") {
    statusTransitions.push({ label: "공개로 전환", value: "PUBLISHED" });
  }

  const createdDate = new Date(content.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 200,
            background: "var(--panel)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--r-sm)",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            boxShadow: "0 4px 20px rgba(0,0,0,.3)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Back link */}
      <a
        href="/studio/contents"
        style={{ color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
      >
        &larr; 콘텐츠 목록
      </a>

      {/* A) Content info header */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
            {content.title}
          </h1>
          <StatusBadge status={content.status} />
          <VideoStatusBadge status={content.videoAssetStatus} />
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)" }}>
          {createdDate} 생성
        </p>
      </div>

      {/* B) Video preview */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={headingStyle}>영상 미리보기</h2>
          <a
            href={`/watch/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}
          >
            전체 화면으로 보기 →
          </a>
        </div>
        <InlinePlayer contentId={id} />
      </div>

      {/* C) Status change */}
      {statusTransitions.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={{ ...headingStyle, marginBottom: 14 }}>공개 상태 변경</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statusTransitions.map((t) => (
              <button
                key={t.value}
                type="button"
                disabled={statusChanging}
                onClick={() => handleStatusChange(t.value)}
                style={{
                  ...statusBtnBase,
                  opacity: statusChanging ? 0.6 : 1,
                }}
              >
                {statusChanging ? "변경 중..." : t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* C) Metadata edit form */}
      <div style={sectionStyle}>
        <h2 style={{ ...headingStyle, marginBottom: 16 }}>콘텐츠 정보 수정</h2>
        <ContentForm
          formMode="edit"
          initialData={content}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel="저장"
          error={formError}
        />
      </div>

      {/* D) Delete */}
      <div style={sectionStyle}>
        <h2 style={{ ...headingStyle, marginBottom: 8 }}>위험 구역</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px" }}>
          콘텐츠를 삭제하면 모든 데이터가 영구적으로 제거됩니다.
        </p>
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          style={{
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
            border: "1px solid #ef4444",
            background: "rgba(239,68,68,.1)",
            color: "#ef4444",
          }}
        >
          콘텐츠 삭제
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        variant="danger"
        title="콘텐츠 삭제"
        message="이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudioContentEditPage() {
  return (
    <StudioLayout>
      <ContentEditContent />
    </StudioLayout>
  );
}
