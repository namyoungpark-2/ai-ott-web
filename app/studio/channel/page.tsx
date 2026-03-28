"use client";

import { useEffect, useState, type FormEvent } from "react";
import StudioSidebar from "@/components/studio/StudioSidebar";
import type { Channel, UpdateChannelPayload } from "@/types/channel";

export default function ChannelSettingsPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchChannel() {
      try {
        const res = await fetch("/api/creator/channel?lang=ko", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("채널 정보를 불러올 수 없습니다.");
        const data: Channel = await res.json();
        if (!cancelled) {
          setChannel(data);
          setName(data.name);
          setDescription(data.description ?? "");
          setProfileImageUrl(data.profileImageUrl ?? "");
          setBannerImageUrl(data.bannerImageUrl ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "채널 정보를 불러올 수 없습니다."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChannel();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    const payload: UpdateChannelPayload = {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      profileImageUrl: profileImageUrl.trim() || undefined,
      bannerImageUrl: bannerImageUrl.trim() || undefined,
    };

    try {
      const res = await fetch("/api/creator/channel", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.message ?? "저장에 실패했습니다."
        );
      }

      const updated: Channel = await res.json();
      setChannel(updated);
      setToast({ type: "success", message: "채널 설정이 저장되었습니다." });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "저장에 실패했습니다.",
      });
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    background: "var(--bg2)",
    border: "1px solid var(--line2)",
    borderRadius: "var(--r-sm)",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <StudioSidebar />

      <div style={{ flex: 1, padding: "32px 40px", maxWidth: 720 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 24px",
          }}
        >
          채널 설정
        </h1>

        {loading && (
          <p style={{ color: "var(--muted)" }}>불러오는 중...</p>
        )}
        {error && <p style={{ color: "#f44" }}>{error}</p>}

        {channel && !loading && (
          <form onSubmit={handleSave}>
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r)",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Name */}
              <div>
                <label style={labelStyle} htmlFor="ch-name">
                  채널 이름
                </label>
                <input
                  id="ch-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="채널 이름"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle} htmlFor="ch-desc">
                  채널 설명
                </label>
                <textarea
                  id="ch-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="채널에 대한 설명을 입력하세요"
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Profile image URL */}
              <div>
                <label style={labelStyle} htmlFor="ch-profile">
                  프로필 이미지 URL
                </label>
                <input
                  id="ch-profile"
                  type="text"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="https://example.com/profile.jpg"
                  style={inputStyle}
                />
                {profileImageUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={profileImageUrl}
                      alt="프로필 미리보기"
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid var(--line)",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Banner image URL */}
              <div>
                <label style={labelStyle} htmlFor="ch-banner">
                  배너 이미지 URL
                </label>
                <input
                  id="ch-banner"
                  type="text"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  style={inputStyle}
                />
                {bannerImageUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={bannerImageUrl}
                      alt="배너 미리보기"
                      style={{
                        width: "100%",
                        maxHeight: 160,
                        objectFit: "cover",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid var(--line)",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Toast */}
              {toast && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      toast.type === "success"
                        ? "var(--accent)"
                        : "#f44",
                  }}
                >
                  {toast.message}
                </p>
              )}

              {/* Save */}
              <div>
                <button
                  type="submit"
                  className="btn-grad"
                  disabled={saving}
                  style={{
                    padding: "10px 32px",
                    borderRadius: "var(--r-sm)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
