"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StudioLayout from "@/components/studio/StudioLayout";
import ConfirmDialog from "@/components/studio/ConfirmDialog";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorSeries, CreateSeriesPayload } from "@/types/channel";

// ─── Shared input styles ─────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--bg2)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-sm)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--muted)",
  marginBottom: 6,
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: "var(--r-sm)",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--text)",
  background: "var(--panel2)",
  border: "1px solid var(--line)",
  cursor: "pointer",
};

const btnSmall: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "var(--r-sm)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text)",
  background: "var(--panel2)",
  border: "1px solid var(--line)",
  cursor: "pointer",
};

// ─── Inner content ───────────────────────────────────────────────────────────

function SeriesListContent() {
  const { locale } = useLocale();
  const [seriesList, setSeriesList] = useState<CreatorSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<CreatorSeries | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hover
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* ── Fetch ── */
  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/creator/series?lang=${locale}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("시리즈 목록을 불러올 수 없습니다.");
      const data: CreatorSeries[] = await res.json();
      setSeriesList(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "시리즈 목록을 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  /* ── Create ── */
  async function handleCreate() {
    if (!createTitle.trim()) return;
    setCreating(true);

    const payload: CreateSeriesPayload = {
      title: createTitle.trim(),
      ...(createDescription.trim()
        ? { description: createDescription.trim() }
        : {}),
    };

    try {
      const res = await fetch("/api/creator/series", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("시리즈 생성에 실패했습니다.");
      setCreateTitle("");
      setCreateDescription("");
      setShowCreateForm(false);
      await fetchSeries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "시리즈 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  }

  /* ── Edit ── */
  function startEdit(series: CreatorSeries) {
    setEditingId(series.seriesId);
    setEditTitle(series.title);
    setEditDescription(series.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleSaveEdit(seriesId: string) {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/creator/series/${seriesId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          lang: locale,
        }),
      });
      if (!res.ok) throw new Error("시리즈 수정에 실패했습니다.");
      cancelEdit();
      await fetchSeries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "시리즈 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/creator/series/${deleteTarget.seriesId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) throw new Error("시리즈 삭제에 실패했습니다.");
      setDeleteTarget(null);
      await fetchSeries();
    } catch (err) {
      alert(err instanceof Error ? err.message : "시리즈 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  /* ── Shimmer skeleton ── */
  function renderSkeleton() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: 20,
            }}
          >
            <div
              style={{
                height: 18,
                width: "60%",
                background: "var(--panel2)",
                borderRadius: "var(--r-sm)",
                marginBottom: 12,
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 14,
                width: "80%",
                background: "var(--panel2)",
                borderRadius: "var(--r-sm)",
                marginBottom: 8,
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                height: 14,
                width: "40%",
                background: "var(--panel2)",
                borderRadius: "var(--r-sm)",
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
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
          시리즈
        </h1>

        <button
          className="btn-grad"
          onClick={() => setShowCreateForm((v) => !v)}
          style={{
            padding: "8px 20px",
            borderRadius: "var(--r-sm)",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          + 새 시리즈
        </button>
      </div>

      {/* Inline creation form */}
      {showCreateForm && (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>제목 *</label>
            <input
              type="text"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="시리즈 제목을 입력하세요"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>설명</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="시리즈 설명 (선택)"
              rows={3}
              style={textareaStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn-grad"
              onClick={handleCreate}
              disabled={creating || !createTitle.trim()}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--r-sm)",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                border: "none",
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating || !createTitle.trim() ? 0.6 : 1,
              }}
            >
              {creating ? "생성 중..." : "생성"}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setCreateTitle("");
                setCreateDescription("");
              }}
              style={btnSecondary}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && renderSkeleton()}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: 20,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#f44", marginBottom: 12 }}>{error}</p>
          <button onClick={fetchSeries} style={btnSecondary}>
            다시 시도
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && seriesList.length === 0 && (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: "48px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", fontSize: 15, margin: 0 }}>
            아직 시리즈가 없습니다
          </p>
        </div>
      )}

      {/* Series card grid */}
      {!loading && !error && seriesList.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {seriesList.map((series) => {
            const isEditing = editingId === series.seriesId;
            const isHovered = hoveredId === series.seriesId;

            return (
              <div
                key={series.seriesId}
                onMouseEnter={() => setHoveredId(series.seriesId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: "var(--panel)",
                  border: `1px solid ${isHovered ? "var(--accent)" : "var(--line)"}`,
                  borderRadius: "var(--r)",
                  padding: 20,
                  transition: "border-color 0.15s",
                }}
              >
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>제목 *</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>설명</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        style={textareaStyle}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-grad"
                        onClick={() => handleSaveEdit(series.seriesId)}
                        disabled={saving || !editTitle.trim()}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "var(--r-sm)",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                          border: "none",
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving || !editTitle.trim() ? 0.6 : 1,
                        }}
                      >
                        {saving ? "저장 중..." : "저장"}
                      </button>
                      <button onClick={cancelEdit} style={btnSecondary}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display mode ── */
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minHeight: 100,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: 0,
                      }}
                    >
                      {series.title}
                    </h3>

                    {series.description && (
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--muted)",
                          margin: 0,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {series.description}
                      </p>
                    )}

                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                      }}
                    >
                      {series.episodeCount}개 에피소드
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: "auto",
                        paddingTop: 8,
                      }}
                    >
                      <Link
                        href={`/studio/series/${series.seriesId}`}
                        style={{
                          ...btnSmall,
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                      >
                        상세
                      </Link>
                      <button
                        onClick={() => startEdit(series)}
                        style={btnSmall}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteTarget(series)}
                        style={{
                          ...btnSmall,
                          color: "#ef4444",
                          borderColor: "rgba(239,68,68,.3)",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="시리즈 삭제"
        message={`"${deleteTarget?.title ?? ""}" 시리즈를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel={deleting ? "삭제 중..." : "삭제"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudioSeriesPage() {
  return (
    <StudioLayout>
      <SeriesListContent />
    </StudioLayout>
  );
}
