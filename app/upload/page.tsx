"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onUpload() {
    if (!file) return alert("mp4 파일을 선택하세요");
    setLoading(true);
  
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || "Untitled");
      fd.append("mode", "MOVIE"); // ✅ 추가
  
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
  
      const text = await res.text();
      if (!res.ok) throw new Error(text);
  
      const data = JSON.parse(text);
      if (!data?.id) throw new Error("Upload response missing id");
  
      // ✅ watch로 안 감
      router.push("/");
  
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 12 }}>
        ← 목록으로
      </a>

      <h1>업로드</h1>

      <div style={{ marginTop: 16 }}>
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 8 }}
          placeholder="영상 제목"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        onClick={onUpload}
        disabled={!file || loading}
        style={{ marginTop: 16, padding: "10px 14px" }}
      >
        {loading ? "업로드 중..." : "업로드"}
      </button>
    </main>
  );
}
