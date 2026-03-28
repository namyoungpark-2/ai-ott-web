"use client";

import { useCallback, useRef, useState } from "react";

type UploadState = "idle" | "selected" | "uploading" | "done" | "error";

type VideoUploaderProps = {
  onFileSelect: (file: File) => void;
  contentId?: string | null;
  onUploadComplete?: () => void;
  onUploadError?: (message: string) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function VideoUploader({
  onFileSelect,
  contentId,
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setState("selected");
      setErrorMsg("");
      onFileSelect(f);
    },
    [onFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const startUpload = useCallback(() => {
    if (!file || !contentId) return;

    setState("uploading");
    setProgress(0);
    setErrorMsg("");

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
        onUploadComplete?.();
      } else {
        const msg = `업로드 실패 (${xhr.status})`;
        setState("error");
        setErrorMsg(msg);
        onUploadError?.(msg);
      }
      xhrRef.current = null;
    };

    xhr.onerror = () => {
      const msg = "네트워크 오류가 발생했습니다";
      setState("error");
      setErrorMsg(msg);
      onUploadError?.(msg);
      xhrRef.current = null;
    };

    xhr.open("POST", `/api/creator/contents/${contentId}/upload`);
    xhr.withCredentials = true;

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  }, [file, contentId, onUploadComplete, onUploadError]);

  const reset = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setFile(null);
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const retry = useCallback(() => {
    startUpload();
  }, [startUpload]);

  /* ---- shared styles ---- */
  const containerBase: React.CSSProperties = {
    borderRadius: "var(--r)",
    background: "var(--panel)",
  };

  /* ---- idle state ---- */
  if (state === "idle") {
    return (
      <div style={containerBase}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--line2)"}`,
            borderRadius: "var(--r)",
            padding: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "rgba(139,92,246,.06)" : "transparent",
            transition: "border-color .15s, background .15s",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p style={{ color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>
            비디오 파일을 드래그하거나 클릭하세요
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            MP4, MOV, AVI, WebM 지원
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>
    );
  }

  /* ---- selected state ---- */
  if (state === "selected" && file) {
    return (
      <div
        style={{
          ...containerBase,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: "1px solid var(--line)",
        }}
      >
        <div style={{ fontSize: 24 }}>🎬</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: "var(--text)",
              fontWeight: 500,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </p>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>
            {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
          }}
          style={{
            background: "var(--bg2)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-sm)",
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          변경
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>
    );
  }

  /* ---- uploading state ---- */
  if (state === "uploading") {
    return (
      <div
        style={{
          ...containerBase,
          padding: "16px",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 500 }}>
            업로드 중… {progress}%
          </span>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {file ? file.name : ""}
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--bg2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              borderRadius: 3,
              transition: "width .2s ease",
            }}
          />
        </div>
      </div>
    );
  }

  /* ---- done state ---- */
  if (state === "done") {
    return (
      <div
        style={{
          ...containerBase,
          padding: "16px",
          border: "1px solid rgba(34,197,94,.3)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>✅</span>
        <span style={{ color: "#22c55e", fontWeight: 500, fontSize: 14 }}>
          업로드가 완료되었습니다
        </span>
      </div>
    );
  }

  /* ---- error state ---- */
  return (
    <div
      style={{
        ...containerBase,
        padding: "16px",
        border: "1px solid rgba(239,68,68,.3)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 20 }}>❌</span>
      <span style={{ color: "#ef4444", fontWeight: 500, fontSize: 14, flex: 1 }}>
        {errorMsg || "업로드에 실패했습니다"}
      </span>
      <button
        type="button"
        onClick={retry}
        style={{
          background: "rgba(239,68,68,.12)",
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "var(--r-sm)",
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}

/** Expose startUpload for parent components via ref pattern */
export type VideoUploaderHandle = {
  startUpload: () => void;
};

export { formatSize };
