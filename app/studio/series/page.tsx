"use client";

import { useEffect, useState, useCallback } from "react";
import StudioSidebar from "@/components/studio/StudioSidebar";
import type {
  CreatorSeries,
  CreateSeriesPayload,
  UpdateSeriesPayload,
} from "@/types/channel";

export default function StudioSeriesPage() {
  const [seriesList, setSeriesList] = useState<CreatorSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSeries = useCallback(async () => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/creator/series?lang=ko", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("시리즈 목록을 불러올 수 없습니다.");
      const data: CreatorSeries[] = await res.json();
      if (!cancelled) setSeriesList(data);
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "시리즈 목록을 불러올 수 없습니다."
        );
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/creator/series?lang=ko", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("시리즈 목록을 불러올 수 없습니다.");
        const data: CreatorSeries[] = await res.json();
        if (!cancelled) setSeriesList(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "시리즈 목록을 불러올 수 없습니다."
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
  }, []);

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
      alert(
        err instanceof Error ? err.message : "시리즈 생성에 실패했습니다."
      );
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

    const payload: UpdateSeriesPayload = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      lang: "ko",
    };

    try {
      const res = await fetch(`/api/creator/series/${seriesId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("시리즈 수정에 실패했습니다.");
      cancelEdit();
      await fetchSeries();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "시리즈 수정에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ── Skeleton ── */
  function renderSkeleton() {
    return Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: 20,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: 18,
            width: "40%",
            background: "var(--panel2)",
            borderRadius: "var(--r-sm)",
            marginBottom: 10,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            height: 14,
            width: "60%",
            background: "var(--panel2)",
            borderRadius: "var(--r-sm)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
    ));
  }

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      <StudioSidebar />

      <div
        style={{
          flex: 1,
          padding: "32px 40px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
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
            시리즈 관리
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

        {/* Create form (inline panel) */}
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
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text)",
                margin: "0 0 16px",
              }}
            >
              새 시리즈
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                제목 *
              </label>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="시리즈 제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--text)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                설명
              </label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="시리즈 설명 (선택)"
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--text)",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
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
                style={{
                  padding: "8px 20px",
                  borderRadius: "var(--r-sm)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text)",
                  background: "var(--panel2)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                }}
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
            <button
              onClick={fetchSeries}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--r-sm)",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text)",
                background: "var(--panel2)",
                border: "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
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
            <p
              style={{
                fontSize: 48,
                margin: "0 0 12px",
              }}
            >
              📁
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 15,
                margin: 0,
              }}
            >
              아직 시리즈가 없습니다. 새 시리즈를 만들어보세요.
            </p>
          </div>
        )}

        {/* Series list */}
        {!loading &&
          !error &&
          seriesList.map((series) => {
            const isEditing = editingId === series.seriesId;

            return (
              <div
                key={series.seriesId}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  padding: 20,
                  marginBottom: 12,
                }}
              >
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--muted)",
                          marginBottom: 6,
                        }}
                      >
                        제목 *
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: "var(--bg2)",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--r-sm)",
                          color: "var(--text)",
                          fontSize: 14,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--muted)",
                          marginBottom: 6,
                        }}
                      >
                        설명
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: "var(--bg2)",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--r-sm)",
                          color: "var(--text)",
                          fontSize: 14,
                          outline: "none",
                          resize: "vertical",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
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
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "var(--r-sm)",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--text)",
                          background: "var(--panel2)",
                          border: "1px solid var(--line)",
                          cursor: "pointer",
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display mode ── */
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--text)",
                          margin: "0 0 6px",
                        }}
                      >
                        {series.title}
                      </h3>
                      {series.description && (
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--muted)",
                            margin: "0 0 8px",
                            lineHeight: 1.5,
                          }}
                        >
                          {series.description}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--muted2)",
                        }}
                      >
                        {series.episodeCount}개 에피소드
                      </span>
                    </div>

                    <button
                      onClick={() => startEdit(series)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "var(--r-sm)",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--text)",
                        background: "var(--panel2)",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Skeleton animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
