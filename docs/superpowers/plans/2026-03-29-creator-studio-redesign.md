# Creator Studio 전면 재설계 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 크리에이터 스튜디오의 모든 페이지를 전면 재작성하여 통합 업로드 플로우, 콘텐츠 편집, 시리즈 관리, 일괄 관리 등 완전한 UGC 크리에이터 경험을 제공한다.

**Architecture:** 공유 컴포넌트 체계(StudioLayout, ContentForm, VideoUploader 등 10개)를 먼저 구축한 후, 각 페이지를 재작성한다. 생성/편집 폼을 ContentForm으로 통합하고, 비디오 업로드는 XMLHttpRequest 기반 프로그레스 바를 사용한다. 반응형 레이아웃으로 모바일 대응한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS custom properties (inline styles), XMLHttpRequest (upload progress)

**Spec:** `docs/superpowers/specs/2026-03-29-creator-studio-redesign-design.md`

---

## File Structure

### New Components (components/studio/)
| File | Responsibility |
|------|---------------|
| `StudioLayout.tsx` | 공통 래퍼: 헤더 + 사이드바 + 콘텐츠 영역 + 채널 Context |
| `StudioHeader.tsx` | 상단 바: 채널명, 채널 보기 링크 |
| `StudioSidebar.tsx` | 사이드바 네비게이션 (재작성) |
| `StudioMobileNav.tsx` | 모바일 수평 탭 바 |
| `ContentForm.tsx` | 생성/편집 공유 폼 |
| `VideoUploader.tsx` | 드래그&드롭 비디오 업로드 + 프로그레스 바 |
| `ThumbnailEditor.tsx` | 썸네일 미리보기 + 커스텀 업로드 |
| `StatusBadge.tsx` | 콘텐츠/비디오 상태 배지 |
| `ConfirmDialog.tsx` | 삭제 확인 모달 |
| `StudioTable.tsx` | 테이블 + 체크박스 + 정렬 |

### Pages (app/studio/) — All Rewritten
| File | Status |
|------|--------|
| `app/studio/page.tsx` | 재작성 |
| `app/studio/channel/page.tsx` | 재작성 |
| `app/studio/contents/page.tsx` | 재작성 |
| `app/studio/contents/new/page.tsx` | 재작성 |
| `app/studio/contents/[id]/edit/page.tsx` | **신규** |
| `app/studio/series/page.tsx` | 재작성 |
| `app/studio/series/[id]/page.tsx` | **신규** |

### API Routes
| File | Change |
|------|--------|
| `app/api/creator/series/[id]/route.ts` | DELETE 핸들러 추가 |

---

## Task 1: 기초 공유 컴포넌트 (StatusBadge, ConfirmDialog)

**Files:**
- Create: `components/studio/StatusBadge.tsx`
- Create: `components/studio/ConfirmDialog.tsx`

- [ ] **Step 1: StatusBadge 컴포넌트 생성**

```tsx
// components/studio/StatusBadge.tsx
"use client";

import type { ContentStatus, VideoAssetStatus } from "@/types/channel";

type BadgeVariant = "gray" | "green" | "yellow" | "red" | "blue";

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: "초안", variant: "gray" },
  PUBLISHED: { label: "공개", variant: "green" },
  UNLISTED: { label: "비공개", variant: "yellow" },
  ARCHIVED: { label: "보관됨", variant: "red" },
};

const VIDEO_STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  UPLOADED: { label: "대기중", variant: "blue" },
  TRANSCODING: { label: "트랜스코딩", variant: "blue" },
  READY: { label: "준비됨", variant: "green" },
  FAILED: { label: "실패", variant: "red" },
};

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  gray: { bg: "rgba(120,120,160,.15)", color: "var(--muted)", border: "rgba(120,120,160,.25)" },
  green: { bg: "rgba(34,197,94,.15)", color: "#22c55e", border: "rgba(34,197,94,.25)" },
  yellow: { bg: "rgba(234,179,8,.15)", color: "#eab308", border: "rgba(234,179,8,.25)" },
  red: { bg: "rgba(239,68,68,.15)", color: "#ef4444", border: "rgba(239,68,68,.25)" },
  blue: { bg: "rgba(59,130,246,.15)", color: "#3b82f6", border: "rgba(59,130,246,.25)" },
};

export function StatusBadge({ status }: { status: ContentStatus | string }) {
  const info = STATUS_MAP[status] ?? { label: status, variant: "gray" as BadgeVariant };
  const style = VARIANT_STYLES[info.variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {info.label}
    </span>
  );
}

export function VideoStatusBadge({ status }: { status: VideoAssetStatus }) {
  if (!status) {
    return (
      <span style={{ fontSize: 12, color: "var(--muted2)" }}>업로드 필요</span>
    );
  }
  const info = VIDEO_STATUS_MAP[status] ?? { label: status, variant: "gray" as BadgeVariant };
  const style = VARIANT_STYLES[info.variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {status === "TRANSCODING" && "🔄 "}
      {status === "READY" && "✅ "}
      {status === "FAILED" && "❌ "}
      {info.label}
    </span>
  );
}
```

- [ ] **Step 2: ConfirmDialog 컴포넌트 생성**

```tsx
// components/studio/ConfirmDialog.tsx
"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColor = variant === "danger" ? "#ef4444" : "var(--accent)";
  const confirmBg = variant === "danger" ? "rgba(239,68,68,.15)" : "rgba(139,92,246,.15)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          padding: 28,
          maxWidth: 420,
          width: "90%",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              fontSize: 14,
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: confirmBg,
              border: `1px solid ${confirmColor}`,
              borderRadius: "var(--r-sm)",
              color: confirmColor,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add components/studio/StatusBadge.tsx components/studio/ConfirmDialog.tsx
git commit -m "feat(studio): add StatusBadge and ConfirmDialog components"
```

---

## Task 2: StudioLayout 시스템 (Header, Sidebar, MobileNav, Layout)

**Files:**
- Create: `components/studio/StudioHeader.tsx`
- Rewrite: `components/studio/StudioSidebar.tsx`
- Create: `components/studio/StudioMobileNav.tsx`
- Create: `components/studio/StudioLayout.tsx`

- [ ] **Step 1: StudioHeader 생성**

```tsx
// components/studio/StudioHeader.tsx
"use client";

import Link from "next/link";
import type { Channel } from "@/types/channel";
import { useLocale } from "@/components/LocaleProvider";

export default function StudioHeader({ channel }: { channel: Channel | null }) {
  const { t } = useLocale();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        padding: "0 24px",
        borderBottom: "1px solid var(--line)",
        background: "var(--panel)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Profile avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--grad-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {channel?.profileImageUrl ? (
            <img
              src={channel.profileImageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            (channel?.name ?? "S").charAt(0).toUpperCase()
          )}
        </div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {channel?.name ?? t("studio.title")}
        </span>
      </div>

      {channel?.handle && (
        <Link
          href={`/channels/${channel.handle}`}
          style={{
            fontSize: 13,
            color: "var(--accent)",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "var(--r-sm)",
            border: "1px solid rgba(139,92,246,.25)",
            transition: "background .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139,92,246,.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {t("studio.viewChannel")}
        </Link>
      )}
    </header>
  );
}
```

- [ ] **Step 2: StudioSidebar 재작성**

```tsx
// components/studio/StudioSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

const ICON: Record<string, string> = {
  dashboard: "📊",
  channel: "⚙️",
  contents: "🎬",
  series: "📁",
};

export default function StudioSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const items = [
    { href: "/studio", label: t("studio.dashboard"), icon: ICON.dashboard },
    { href: "/studio/channel", label: t("studio.channelSettings"), icon: ICON.channel },
    { href: "/studio/contents", label: t("studio.myContents"), icon: ICON.contents },
    { href: "/studio/series", label: t("studio.series"), icon: ICON.series },
  ];

  const bottomItems = [
    { href: "/", label: "홈으로", icon: "🏠" },
  ];

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--panel)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 0",
        overflowY: "auto",
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => {
          const isActive =
            item.href === "/studio"
              ? pathname === "/studio"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--text)" : "var(--muted)",
                background: isActive
                  ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                  : "transparent",
                textDecoration: "none",
                transition: "background .15s, color .15s",
                borderLeft: isActive
                  ? "3px solid var(--accent)"
                  : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ height: 1, background: "var(--line)", margin: "8px 20px" }} />
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              fontSize: 13,
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color .15s",
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: StudioMobileNav 생성**

```tsx
// components/studio/StudioMobileNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export default function StudioMobileNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const items = [
    { href: "/studio", label: t("studio.dashboard") },
    { href: "/studio/channel", label: t("studio.channelSettings") },
    { href: "/studio/contents", label: t("studio.myContents") },
    { href: "/studio/series", label: t("studio.series") },
  ];

  return (
    <nav
      className="rail-scroll"
      style={{
        display: "flex",
        gap: 4,
        padding: "10px 16px",
        borderBottom: "1px solid var(--line)",
        background: "var(--panel)",
        overflowX: "auto",
      }}
    >
      {items.map((item) => {
        const isActive =
          item.href === "/studio"
            ? pathname === "/studio"
            : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`cat-pill${isActive ? " active" : ""}`}
            style={{ fontSize: 13 }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: StudioLayout 생성**

```tsx
// components/studio/StudioLayout.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Channel } from "@/types/channel";
import { useLocale } from "@/components/LocaleProvider";
import StudioHeader from "./StudioHeader";
import StudioSidebar from "./StudioSidebar";
import StudioMobileNav from "./StudioMobileNav";

type StudioContextValue = {
  channel: Channel | null;
  loading: boolean;
  refetchChannel: () => void;
};

const StudioContext = createContext<StudioContextValue>({
  channel: null,
  loading: true,
  refetchChannel: () => {},
});

export function useStudio() {
  return useContext(StudioContext);
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/creator/channel?lang=${locale}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const data: Channel = await res.json();
          setChannel(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale, fetchKey]);

  const refetchChannel = () => setFetchKey((k) => k + 1);

  return (
    <StudioContext.Provider value={{ channel, loading, refetchChannel }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
        <StudioHeader channel={channel} />

        {/* Desktop: sidebar + content */}
        <div
          style={{ display: "flex", flex: 1 }}
          className="studio-desktop"
        >
          {/* Sidebar — hidden on mobile via CSS */}
          <div className="studio-sidebar-wrap">
            <StudioSidebar />
          </div>

          <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1080, width: "100%" }}>
            {children}
          </main>
        </div>

        {/* Mobile nav — shown only on mobile via CSS */}
        <div className="studio-mobile-nav-wrap">
          <StudioMobileNav />
        </div>
      </div>

      {/* Responsive CSS — injected once */}
      <style>{`
        .studio-mobile-nav-wrap { display: none; }
        @media (max-width: 768px) {
          .studio-sidebar-wrap { display: none; }
          .studio-mobile-nav-wrap {
            display: block;
            position: sticky;
            top: 56px;
            z-index: 40;
          }
          .studio-desktop { flex-direction: column; }
          .studio-desktop main { padding: 20px 16px; }
        }
      `}</style>
    </StudioContext.Provider>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add components/studio/StudioHeader.tsx components/studio/StudioSidebar.tsx components/studio/StudioMobileNav.tsx components/studio/StudioLayout.tsx
git commit -m "feat(studio): add layout system with header, sidebar, mobile nav"
```

---

## Task 3: VideoUploader & ThumbnailEditor

**Files:**
- Create: `components/studio/VideoUploader.tsx`
- Create: `components/studio/ThumbnailEditor.tsx`

- [ ] **Step 1: VideoUploader 생성**

XMLHttpRequest 기반으로 업로드 프로그레스를 지원하는 컴포넌트.

```tsx
// components/studio/VideoUploader.tsx
"use client";

import { useCallback, useRef, useState } from "react";

type UploadState = "idle" | "selected" | "uploading" | "done" | "error";

type VideoUploaderProps = {
  onFileSelect: (file: File) => void;
  contentId?: string | null;
  onUploadComplete?: () => void;
  onUploadError?: (message: string) => void;
};

export default function VideoUploader({
  onFileSelect,
  contentId,
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setState("selected");
      setProgress(0);
      setErrorMsg(null);
      onFileSelect(f);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("video/")) handleFile(f);
    },
    [handleFile],
  );

  const startUpload = useCallback(() => {
    if (!file || !contentId) return;
    setState("uploading");
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setState("done");
        setProgress(100);
        onUploadComplete?.();
      } else {
        setState("error");
        setErrorMsg("업로드에 실패했습니다.");
        onUploadError?.("업로드에 실패했습니다.");
      }
    };

    xhr.onerror = () => {
      setState("error");
      setErrorMsg("네트워크 오류가 발생했습니다.");
      onUploadError?.("네트워크 오류가 발생했습니다.");
    };

    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", `/api/creator/contents/${contentId}/upload`);
    xhr.withCredentials = true;
    xhr.send(formData);
  }, [file, contentId, onUploadComplete, onUploadError]);

  const retry = useCallback(() => {
    setState("selected");
    setProgress(0);
    setErrorMsg(null);
  }, []);

  // 외부에서 업로드 트리거 — contentId가 설정되면 자동 시작
  // startUpload를 export하기 위해 ref로 노출하는 대신,
  // 부모가 contentId prop 변경 시 호출할 수 있게 함

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div>
      {/* Drop zone */}
      {(state === "idle" || state === "selected") && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--line2)"}`,
            borderRadius: "var(--r)",
            background: dragOver ? "rgba(139,92,246,.06)" : "var(--bg2)",
            padding: state === "idle" ? "60px 20px" : "24px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color .15s, background .15s",
          }}
        >
          {state === "idle" && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
                비디오 파일을 드래그하거나 클릭하세요
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                MP4, MOV, AVI, WebM 지원
              </p>
            </>
          )}
          {state === "selected" && file && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>🎬</span>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{formatSize(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setState("idle");
                }}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  background: "transparent",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                변경
              </button>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Uploading progress */}
      {state === "uploading" && (
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: 20,
            background: "var(--panel)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🎬</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{file?.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>업로드 중... {progress}%</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--bg2)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--accent)",
                borderRadius: 3,
                transition: "width .3s",
              }}
            />
          </div>
        </div>
      )}

      {/* Done */}
      {state === "done" && (
        <div
          style={{
            border: "1px solid rgba(34,197,94,.3)",
            borderRadius: "var(--r)",
            padding: 20,
            background: "rgba(34,197,94,.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e" }}>업로드 완료</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{file?.name}</div>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div
          style={{
            border: "1px solid rgba(239,68,68,.3)",
            borderRadius: "var(--r)",
            padding: 20,
            background: "rgba(239,68,68,.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>❌</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ef4444" }}>업로드 실패</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{errorMsg}</div>
            </div>
          </div>
          <button
            onClick={retry}
            style={{
              padding: "6px 16px",
              fontSize: 13,
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

// Export startUpload for parent to trigger
export type VideoUploaderHandle = {
  startUpload: () => void;
};
```

- [ ] **Step 2: ThumbnailEditor 생성**

```tsx
// components/studio/ThumbnailEditor.tsx
"use client";

import { useRef, useState } from "react";

type ThumbnailEditorProps = {
  currentUrl: string | null;
  onUrlChange: (url: string | null) => void;
};

export default function ThumbnailEditor({ currentUrl, onUrlChange }: ThumbnailEditorProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setCustomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    // For now, we pass the object URL; in a real implementation,
    // this would upload to S3 and return the URL
    onUrlChange(objectUrl);
  };

  const handleReset = () => {
    setCustomFile(null);
    setPreview(currentUrl);
    onUrlChange(currentUrl);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Preview */}
        <div
          style={{
            width: 160,
            aspectRatio: "16/9",
            borderRadius: "var(--r-sm)",
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--bg2)",
            flexShrink: 0,
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="썸네일 미리보기"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setPreview(null)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted2)",
                fontSize: 12,
              }}
            >
              썸네일 없음
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            {customFile ? "다른 이미지 선택" : "커스텀 썸네일 업로드"}
          </button>
          {customFile && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                background: "transparent",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              원래대로
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add components/studio/VideoUploader.tsx components/studio/ThumbnailEditor.tsx
git commit -m "feat(studio): add VideoUploader with progress bar and ThumbnailEditor"
```

---

## Task 4: StudioTable 컴포넌트

**Files:**
- Create: `components/studio/StudioTable.tsx`

- [ ] **Step 1: StudioTable 생성**

체크박스 선택, 컬럼 정렬을 지원하는 재사용 테이블 컴포넌트.

```tsx
// components/studio/StudioTable.tsx
"use client";

import { useState, useCallback } from "react";

export type Column<T> = {
  key: string;
  label: string;
  width?: string;
  render: (item: T) => React.ReactNode;
  sortable?: boolean;
};

type StudioTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  onRowClick?: (item: T) => void;
};

export default function StudioTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onRowClick,
}: StudioTableProps<T>) {
  const allKeys = new Set(data.map(rowKey));
  const allSelected = selectedKeys ? allKeys.size > 0 && allKeys.size === selectedKeys.size : false;

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allKeys));
    }
  }, [allSelected, allKeys, onSelectionChange]);

  const toggleOne = useCallback(
    (key: string) => {
      if (!onSelectionChange || !selectedKeys) return;
      const next = new Set(selectedKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onSelectionChange(next);
    },
    [selectedKeys, onSelectionChange],
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)" }}>
            {selectable && (
              <th style={{ width: 40, padding: "10px 8px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  width: col.width,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const key = rowKey(item);
            const isSelected = selectedKeys?.has(key) ?? false;
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(item)}
                style={{
                  borderBottom: "1px solid var(--line2)",
                  background: isSelected ? "rgba(139,92,246,.06)" : "transparent",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background .1s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,.02)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {selectable && (
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOne(key);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "10px 12px" }}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/studio/StudioTable.tsx
git commit -m "feat(studio): add StudioTable component with checkbox selection"
```

---

## Task 5: ContentForm 공유 폼

**Files:**
- Create: `components/studio/ContentForm.tsx`

- [ ] **Step 1: ContentForm 생성**

생성/편집 모드에서 공유하는 폼 컴포넌트. 생성 모드에서는 VideoUploader가 표시되고, 편집 모드에서는 기존 데이터를 프리필한다.

```tsx
// components/studio/ContentForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorContent, CreatorSeries } from "@/types/channel";
import ThumbnailEditor from "./ThumbnailEditor";

type Mode = "MOVIE" | "EPISODE";

type ContentFormData = {
  title: string;
  description: string;
  mode: Mode;
  seriesId: string;
  newSeriesTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  thumbnailUrl: string | null;
};

type ContentFormProps = {
  formMode: "create" | "edit";
  initialData?: CreatorContent | null;
  onSubmit: (data: ContentFormData) => void;
  submitting: boolean;
  submitLabel: string;
  error?: string | null;
};

export default function ContentForm({
  formMode,
  initialData,
  onSubmit,
  submitting,
  submitLabel,
  error,
}: ContentFormProps) {
  const { locale } = useLocale();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<Mode>(initialData?.contentType ?? "MOVIE");
  const [seriesId, setSeriesId] = useState("");
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialData?.thumbnailUrl ?? null);

  const [seriesList, setSeriesList] = useState<CreatorSeries[]>([]);
  const isNewSeries = seriesId === "__new__";

  // Fetch series for EPISODE mode
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/creator/series?lang=${locale}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        setSeriesList(Array.isArray(data) ? data : data.series ?? []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      mode,
      seriesId: isNewSeries ? "" : seriesId,
      newSeriesTitle: isNewSeries ? newSeriesTitle.trim() : "",
      seasonNumber,
      episodeNumber,
      thumbnailUrl,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    background: "var(--bg2)",
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--muted)",
    marginBottom: 6,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="콘텐츠 제목"
            required
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="콘텐츠에 대한 설명을 입력하세요"
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Content Type — only in create mode */}
        {formMode === "create" && (
          <div>
            <label style={labelStyle}>콘텐츠 유형</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["MOVIE", "EPISODE"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    fontSize: 14,
                    fontWeight: mode === m ? 600 : 400,
                    border: "1px solid",
                    borderColor: mode === m ? "var(--accent)" : "var(--line)",
                    background: mode === m ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent",
                    color: mode === m ? "var(--accent)" : "var(--muted)",
                    cursor: "pointer",
                    borderRadius: "var(--r-sm)",
                    transition: "all .15s",
                  }}
                >
                  {m === "MOVIE" ? "단독 영상" : "에피소드"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Episode fields */}
        {mode === "EPISODE" && formMode === "create" && (
          <>
            <div>
              <label style={labelStyle}>시리즈</label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
              >
                <option value="">시리즈 선택...</option>
                {seriesList.map((s) => (
                  <option key={s.seriesId} value={s.seriesId}>
                    {s.title} ({s.episodeCount}편)
                  </option>
                ))}
                <option value="__new__">+ 새 시리즈 생성</option>
              </select>
            </div>

            {isNewSeries && (
              <div>
                <label style={labelStyle}>새 시리즈 제목</label>
                <input
                  type="text"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  placeholder="시리즈 제목"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>시즌</label>
                <input
                  type="number"
                  min={1}
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(Number(e.target.value) || 1)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>에피소드</label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value) || 1)}
                  style={inputStyle}
                />
              </div>
            </div>
          </>
        )}

        {/* Thumbnail — edit mode */}
        {formMode === "edit" && (
          <div>
            <label style={labelStyle}>썸네일</label>
            <ThumbnailEditor currentUrl={thumbnailUrl} onUrlChange={setThumbnailUrl} />
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="btn-grad"
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: 15,
            fontWeight: 600,
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting || !title.trim() ? 0.6 : 1,
          }}
        >
          {submitting ? "처리 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add components/studio/ContentForm.tsx
git commit -m "feat(studio): add ContentForm shared component for create/edit"
```

---

## Task 6: 시리즈 삭제 API 프록시 추가

**Files:**
- Modify: `app/api/creator/series/[id]/route.ts` — DELETE 핸들러 추가

- [ ] **Step 1: DELETE 핸들러 추가**

기존 PUT 핸들러가 있는 파일에 DELETE를 추가한다. 기존 `forwardHeaders` 함수를 재사용한다.

```typescript
// app/api/creator/series/[id]/route.ts 에 추가
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
    console.log("[OTT] creator series DELETE proxy", id);

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authHeader = req.headers.get("authorization");
    const cookie = req.headers.get("cookie") ?? "";
    if (authHeader) {
      headers["authorization"] = authHeader;
    } else {
      const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
      if (match?.[1]) headers["authorization"] = `Bearer ${match[1]}`;
    }
    if (cookie) headers["cookie"] = cookie;

    const r = await fetch(`${base}/api/app/creator/series/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("[OTT] creator series DELETE proxy error:", r.status, text);
    }
    return new NextResponse(text, { status: r.status });
  } catch (e) {
    console.error("[OTT] creator series DELETE proxy error:", e);
    return NextResponse.json({ error: "series delete proxy failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add "app/api/creator/series/[id]/route.ts"
git commit -m "feat(api): add DELETE handler for creator series proxy"
```

---

## Task 7: 대시보드 페이지 재작성

**Files:**
- Rewrite: `app/studio/page.tsx`

- [ ] **Step 1: 대시보드 페이지 재작성**

StudioLayout을 사용하고, 채널 정보 카드 + 콘텐츠 요약 + 최근 콘텐츠 + 빠른 액션을 표시한다.

```tsx
// app/studio/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudioLayout, { useStudio } from "@/components/studio/StudioLayout";
import { StatusBadge, VideoStatusBadge } from "@/components/studio/StatusBadge";
import { useLocale } from "@/components/LocaleProvider";
import type { CreatorContent } from "@/types/channel";

function DashboardContent() {
  const { channel, loading: channelLoading } = useStudio();
  const { locale, t } = useLocale();
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [contentsLoading, setContentsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/creator/contents?lang=${locale}&limit=50`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (cancelled || !res.ok) return;
        const data = await res.json();
        setContents(Array.isArray(data) ? data : data.contents ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setContentsLoading(false); });
    return () => { cancelled = true; };
  }, [locale]);

  const total = contents.length;
  const published = contents.filter((c) => c.status === "PUBLISHED").length;
  const draft = contents.filter((c) => c.status === "DRAFT").length;
  const unlisted = contents.filter((c) => c.status === "UNLISTED").length;
  const recent = contents.slice(0, 5);

  if (channelLoading) {
    return <p style={{ color: "var(--muted)" }}>불러오는 중...</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px" }}>{t("studio.dashboard")}</h1>

      {/* Channel card */}
      {channel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 20,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--grad-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {channel.profileImageUrl ? (
              <img src={channel.profileImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              channel.name.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{channel.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              @{channel.handle} · 구독자 {channel.subscriberCount.toLocaleString()}명
            </div>
          </div>
          <Link
            href={`/channels/${channel.handle}`}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              color: "var(--accent)",
              border: "1px solid rgba(139,92,246,.25)",
              borderRadius: "var(--r-sm)",
              textDecoration: "none",
            }}
          >
            {t("studio.viewChannel")}
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { label: "전체", value: total, color: "var(--text)" },
          { label: "공개", value: published, color: "#22c55e" },
          { label: "초안", value: draft, color: "var(--muted)" },
          { label: "비공개", value: unlisted, color: "#eab308" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: 16,
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{contentsLoading ? "-" : s.value}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <Link href="/studio/contents/new">
          <button className="btn-grad" style={{ padding: "10px 24px", fontSize: 14, fontWeight: 600, border: "none" }}>
            + {t("studio.newContent")}
          </button>
        </Link>
        <Link href="/studio/channel">
          <button style={{ padding: "10px 24px", fontSize: 14 }}>
            {t("studio.channelSettings")}
          </button>
        </Link>
      </div>

      {/* Recent contents */}
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>최근 콘텐츠</h2>
      {contentsLoading ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>불러오는 중...</p>
      ) : recent.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>아직 콘텐츠가 없습니다.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map((c) => (
            <Link
              key={c.contentId}
              href={`/studio/contents/${c.contentId}/edit`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
                color: "var(--text)",
                transition: "border-color .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                </div>
              </div>
              <StatusBadge status={c.status} />
              <VideoStatusBadge status={c.videoAssetStatus} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudioDashboardPage() {
  return (
    <StudioLayout>
      <DashboardContent />
    </StudioLayout>
  );
}
```

- [ ] **Step 2: 커밋**

```bash
git add app/studio/page.tsx
git commit -m "feat(studio): rewrite dashboard with stats, recent contents, quick actions"
```

---

## Task 8: 채널 설정 페이지 재작성

**Files:**
- Rewrite: `app/studio/channel/page.tsx`

- [ ] **Step 1: 채널 설정 페이지 재작성**

StudioLayout 사용, useStudio() context에서 채널 데이터 활용. 기존 기능(이름, 설명, handle, 이미지) 유지 + StudioLayout 통합.

기존 코드의 로직은 동일하되 `StudioLayout`으로 래핑하고 `useStudio()`에서 채널 데이터를 가져오는 구조로 변경한다. 기존 `app/studio/channel/page.tsx`를 읽어서 폼 로직은 유지하고 레이아웃만 교체한다.

핵심 변경:
- `<div style={{ display: "flex" }}><StudioSidebar />...` 패턴을 `<StudioLayout>...</StudioLayout>`로 교체
- `useStudio()`의 `channel`과 `refetchChannel`을 활용
- 나머지 폼 로직 (name, description, handle, profileImageUrl, bannerImageUrl) 유지

- [ ] **Step 2: 커밋**

```bash
git add app/studio/channel/page.tsx
git commit -m "feat(studio): rewrite channel settings with StudioLayout"
```

---

## Task 9: 콘텐츠 목록 페이지 재작성 (일괄 관리 포함)

**Files:**
- Rewrite: `app/studio/contents/page.tsx`

- [ ] **Step 1: 콘텐츠 목록 페이지 재작성**

StudioLayout + StudioTable + StatusBadge + ConfirmDialog + 일괄 관리.

핵심 기능:
- StudioTable 사용 (체크박스 선택)
- 상태 필터 pill 버튼
- 일괄 액션 바 (선택 시 표시): 일괄 공개 / 일괄 비공개 / 일괄 삭제
- 편집: `/studio/contents/[id]/edit` 링크
- 상태 토글: PATCH /creator/contents/[id]/status
- 삭제: DELETE /creator/contents/[id] + ConfirmDialog
- ConfirmDialog로 window.confirm() 대체

- [ ] **Step 2: 커밋**

```bash
git add app/studio/contents/page.tsx
git commit -m "feat(studio): rewrite contents list with bulk actions and StudioTable"
```

---

## Task 10: 콘텐츠 생성 페이지 재작성 (통합 업로드)

**Files:**
- Rewrite: `app/studio/contents/new/page.tsx`

- [ ] **Step 1: 콘텐츠 생성 페이지 재작성**

통합 플로우: VideoUploader (파일 선택) → ContentForm (메타 입력) → 한번에 생성+업로드.

핵심 플로우:
1. VideoUploader로 파일 선택 (필수)
2. 파일 선택 후 ContentForm 표시
3. "업로드 & 생성" 클릭:
   - POST /creator/contents → contentId
   - VideoUploader.startUpload(contentId) → 업로드 + 프로그레스
4. 완료 → 콘텐츠 목록으로 이동

- [ ] **Step 2: 커밋**

```bash
git add app/studio/contents/new/page.tsx
git commit -m "feat(studio): rewrite content creation with integrated video upload"
```

---

## Task 11: 콘텐츠 편집 페이지 (신규)

**Files:**
- Create: `app/studio/contents/[id]/edit/page.tsx`

- [ ] **Step 1: 콘텐츠 편집 페이지 생성**

ContentForm(mode="edit") + 상태 변경 + 삭제 + 썸네일 편집.

핵심:
- GET /creator/contents로 목록 가져온 뒤 해당 ID의 콘텐츠 찾기
- ContentForm에 initialData 전달
- 저장: PUT /creator/contents/[id]/metadata
- 상태 변경: PATCH /creator/contents/[id]/status
- 삭제: DELETE /creator/contents/[id] + ConfirmDialog → 목록으로 리다이렉트

- [ ] **Step 2: 커밋**

```bash
git add "app/studio/contents/[id]/edit/page.tsx"
git commit -m "feat(studio): add content edit page with metadata and thumbnail editing"
```

---

## Task 12: 시리즈 목록 페이지 재작성 (삭제 기능)

**Files:**
- Rewrite: `app/studio/series/page.tsx`

- [ ] **Step 1: 시리즈 목록 페이지 재작성**

StudioLayout + 생성/편집/삭제 + ConfirmDialog.

핵심:
- 시리즈 카드 그리드
- "새 시리즈" 인라인 폼
- 인라인 편집 (수정 버튼 → 입력 모드)
- 삭제: DELETE /creator/series/[id] + ConfirmDialog
- 시리즈 클릭 → /studio/series/[id] (상세 페이지)

- [ ] **Step 2: 커밋**

```bash
git add app/studio/series/page.tsx
git commit -m "feat(studio): rewrite series list with delete and inline editing"
```

---

## Task 13: 시리즈 상세 페이지 (신규)

**Files:**
- Create: `app/studio/series/[id]/page.tsx`

- [ ] **Step 1: 시리즈 상세 페이지 생성**

시리즈 메타 편집 + 에피소드 목록.

핵심:
- 시리즈 정보 표시/편집 (제목, 설명)
- 에피소드 목록: GET /creator/contents에서 해당 시리즈의 EPISODE만 필터
- 에피소드는 시즌/에피소드 번호 기준 정렬
- 에피소드 클릭 → /studio/contents/[id]/edit
- "에피소드 추가" → /studio/contents/new?seriesId={id}

- [ ] **Step 2: 커밋**

```bash
git add "app/studio/series/[id]/page.tsx"
git commit -m "feat(studio): add series detail page with episode management"
```

---

## Task 14: 최종 통합 및 정리

**Files:**
- Remove old sidebar import patterns from all pages (already handled by StudioLayout)
- Verify all pages compile

- [ ] **Step 1: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | grep -v "open-next"
```

Expected: no errors from studio files.

- [ ] **Step 2: 최종 커밋**

```bash
git add -A
git commit -m "feat(studio): complete creator studio redesign

- StudioLayout with responsive header, sidebar, mobile nav
- ContentForm shared between create/edit modes
- VideoUploader with drag-and-drop and progress bar
- ThumbnailEditor with custom upload
- StudioTable with checkbox selection and bulk actions
- ConfirmDialog replacing window.confirm()
- StatusBadge/VideoStatusBadge components
- Dashboard with stats, recent contents, quick actions
- Content list with filtering and bulk management
- Integrated content creation (video + metadata)
- Content edit page (previously 404)
- Series management with delete and detail page
- Episode management within series"
```
