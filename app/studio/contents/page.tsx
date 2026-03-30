"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudioLayout from "@/components/studio/StudioLayout";
import StudioTable, { type Column } from "@/components/studio/StudioTable";
import { StatusBadge, VideoStatusBadge } from "@/components/studio/StatusBadge";
import ConfirmDialog from "@/components/studio/ConfirmDialog";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorContent, ContentStatus } from "@/types/channel";
import { ModalPlayer } from "@/components/studio/VideoPreview";

const STATUS_FILTERS: { label: string; value: ContentStatus | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "PUBLISHED", value: "PUBLISHED" },
  { label: "UNLISTED", value: "UNLISTED" },
];

export default function StudioContentsPage() {
  return (
    <StudioLayout>
      <ContentsListContent />
    </StudioLayout>
  );
}

function ContentsListContent() {
  const { locale } = useLocale();
  const router = useRouter();
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContentStatus | "ALL">("ALL");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Delete confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Bulk delete confirm dialog state
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Video preview modal
  const [previewContentId, setPreviewContentId] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/creator/contents?lang=${locale}&limit=50`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) throw new Error("콘텐츠 목록을 불러올 수 없습니다.");
      const data = await res.json();
      setContents(Array.isArray(data) ? data : data.contents ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "콘텐츠 목록을 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/creator/contents?lang=${locale}&limit=50`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok) throw new Error("콘텐츠 목록을 불러올 수 없습니다.");
        const data = await res.json();
        if (!cancelled) {
          setContents(Array.isArray(data) ? data : data.contents ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "콘텐츠 목록을 불러올 수 없습니다.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? contents
        : contents.filter((c) => c.status === filter),
    [contents, filter],
  );

  // ─── Single item actions ──────────────────────────────────────────────────

  const handleStatusToggle = async (
    contentId: string,
    currentStatus: ContentStatus,
  ) => {
    const newStatus = currentStatus === "PUBLISHED" ? "UNLISTED" : "PUBLISHED";
    try {
      const res = await fetch(
        `/api/creator/contents/${contentId}/status?status=${newStatus}`,
        { method: "PATCH", credentials: "include" },
      );
      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
      await fetchContents();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다.",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/creator/contents/${deleteTarget.id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      setDeleteTarget(null);
      await fetchContents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  // ─── Bulk actions ─────────────────────────────────────────────────────────

  const handleBulkPublish = async () => {
    const ids = Array.from(selectedKeys);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/creator/contents/${id}/status?status=PUBLISHED`, {
            method: "PATCH",
            credentials: "include",
          }),
        ),
      );
      setSelectedKeys(new Set());
      await fetchContents();
    } catch {
      alert("일괄 공개 처리 중 오류가 발생했습니다.");
    }
  };

  const handleBulkUnlist = async () => {
    const ids = Array.from(selectedKeys);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/creator/contents/${id}/status?status=UNLISTED`, {
            method: "PATCH",
            credentials: "include",
          }),
        ),
      );
      setSelectedKeys(new Set());
      await fetchContents();
    } catch {
      alert("일괄 비공개 처리 중 오류가 발생했습니다.");
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedKeys);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/creator/contents/${id}`, {
            method: "DELETE",
            credentials: "include",
          }),
        ),
      );
      setBulkDeleteOpen(false);
      setSelectedKeys(new Set());
      await fetchContents();
    } catch {
      alert("일괄 삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────

  const actionBtnStyle: React.CSSProperties = {
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    color: "var(--text)",
    transition: "border-color 0.15s",
  };

  const columns: Column<CreatorContent>[] = [
    {
      key: "thumbnail",
      label: "썸네일",
      width: "56px",
      render: (c) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setPreviewContentId(c.contentId);
          }}
          style={{ position: "relative", cursor: "pointer", width: 40, height: 24 }}
          title="영상 미리보기"
        >
          {c.thumbnailUrl ? (
            <img
              src={c.thumbnailUrl}
              alt=""
              style={{
                width: 40,
                height: 24,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 24,
                borderRadius: 4,
                background:
                  "linear-gradient(135deg, rgba(139,92,246,.3), rgba(59,130,246,.3))",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,.35)",
              borderRadius: 4,
              opacity: 0.8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
              <polygon points="8 5 20 12 8 19" />
            </svg>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: "제목",
      render: (c) => (
        <span
          style={{
            fontWeight: 600,
            color: "var(--text)",
            maxWidth: 240,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          {c.title}
        </span>
      ),
    },
    {
      key: "contentType",
      label: "타입",
      width: "80px",
      render: (c) => (
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {c.contentType}
        </span>
      ),
    },
    {
      key: "status",
      label: "상태",
      width: "100px",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "videoAssetStatus",
      label: "비디오",
      width: "120px",
      render: (c) => <VideoStatusBadge status={c.videoAssetStatus} />,
    },
    {
      key: "createdAt",
      label: "날짜",
      width: "100px",
      render: (c) => (
        <span
          style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}
        >
          {new Date(c.createdAt).toLocaleDateString("ko-KR")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "액션",
      width: "200px",
      render: (c) => (
        <div
          style={{ display: "flex", gap: 6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/studio/contents/${c.contentId}/edit`}
            style={{
              ...actionBtnStyle,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            편집
          </Link>
          {(c.status === "PUBLISHED" || c.status === "UNLISTED") && (
            <button
              onClick={() => handleStatusToggle(c.contentId, c.status)}
              style={actionBtnStyle}
            >
              {c.status === "PUBLISHED" ? "비공개" : "공개"}
            </button>
          )}
          <button
            onClick={() =>
              setDeleteTarget({ id: c.contentId, title: c.title })
            }
            style={{
              ...actionBtnStyle,
              color: "#ef4444",
              borderColor: "rgba(239,68,68,.3)",
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
          }}
        >
          내 콘텐츠
        </h1>
        <Link
          href="/studio/contents/new"
          className="btn-grad"
          style={{
            padding: "8px 20px",
            borderRadius: "var(--r-sm)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          새 콘텐츠
        </Link>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value);
              setSelectedKeys(new Set());
            }}
            className={`cat-pill${filter === f.value ? " active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedKeys.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            marginBottom: 12,
            background: "rgba(139,92,246,.08)",
            border: "1px solid rgba(139,92,246,.25)",
            borderRadius: "var(--r-sm)",
          }}
        >
          <span
            style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}
          >
            {selectedKeys.size}개 선택됨
          </span>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              onClick={handleBulkPublish}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid rgba(34,197,94,.4)",
                borderRadius: "var(--r-sm)",
                background: "rgba(34,197,94,.1)",
                color: "#22c55e",
                cursor: "pointer",
              }}
            >
              일괄 공개
            </button>
            <button
              onClick={handleBulkUnlist}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid rgba(234,179,8,.4)",
                borderRadius: "var(--r-sm)",
                background: "rgba(234,179,8,.1)",
                color: "#eab308",
                cursor: "pointer",
              }}
            >
              일괄 비공개
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid rgba(239,68,68,.4)",
                borderRadius: "var(--r-sm)",
                background: "rgba(239,68,68,.1)",
                color: "#ef4444",
                cursor: "pointer",
              }}
            >
              일괄 삭제
            </button>
          </div>
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <p style={{ color: "var(--muted)" }}>불러오는 중...</p>
      )}
      {error && <p style={{ color: "#f44" }}>{error}</p>}

      {/* Content table */}
      {!loading && !error && (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            overflow: "hidden",
          }}
        >
          <StudioTable<CreatorContent>
            columns={columns}
            data={filtered}
            rowKey={(c) => c.contentId}
            selectable
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onRowClick={(c) =>
              router.push(`/studio/contents/${c.contentId}/edit`)
            }
          />
        </div>
      )}

      {/* Single delete confirm dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="콘텐츠 삭제"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Video preview modal */}
      {previewContentId && (
        <ModalPlayer
          contentId={previewContentId}
          onClose={() => setPreviewContentId(null)}
        />
      )}

      {/* Bulk delete confirm dialog */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="일괄 삭제"
        message={`선택한 ${selectedKeys.size}개의 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </>
  );
}
