"use client";

import { useCallback, useRef, useState } from "react";

type ThumbnailEditorProps = {
  currentUrl: string | null;
  onUrlChange: (url: string | null) => void;
};

export function ThumbnailEditor({ currentUrl, onUrlChange }: ThumbnailEditorProps) {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // revoke previous object URL to avoid memory leak
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);
      setCustomFile(file);
      setPreviewUrl(url);
      onUrlChange(url);
    },
    [previewUrl, onUrlChange],
  );

  const handleReset = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setCustomFile(null);
    setPreviewUrl(null);
    onUrlChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl, onUrlChange]);

  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* thumbnail preview */}
      <div
        style={{
          width: 160,
          aspectRatio: "16 / 9",
          borderRadius: "var(--r-sm)",
          border: "1px solid var(--line)",
          overflow: "hidden",
          background: "var(--bg2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="썸네일 미리보기"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            썸네일 없음
          </span>
        )}
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            background: "var(--bg2)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-sm)",
            padding: "6px 12px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          커스텀 썸네일 업로드
        </button>

        {customFile && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              padding: "6px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            원래대로
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
