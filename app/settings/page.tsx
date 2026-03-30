"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import ConfirmDialog from "@/components/studio/ConfirmDialog";

// ─── Types ──────────────────────────────────────────────────────────────────

type TabKey =
  | "profile"
  | "password"
  | "subscription"
  | "channels"
  | "history"
  | "account";

type ProfileData = {
  id: string;
  username: string;
  email?: string;
  role: string;
  subscriptionTier: string;
  createdAt?: string;
};

type SubscribedChannel = {
  id: string;
  handle: string;
  name: string;
  profileImageUrl?: string;
  isOfficial: boolean;
  subscriberCount: number;
  status: string;
};

type WatchHistoryItem = {
  contentId: string;
  title: string;
  thumbnailUrl: string;
  positionMs: number;
  durationMs: number;
  progressPercent: number;
};

type Toast = {
  type: "success" | "error";
  message: string;
};

// ─── Tab definitions ────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "프로필" },
  { key: "password", label: "비밀번호" },
  { key: "subscription", label: "구독 정보" },
  { key: "channels", label: "내 구독 스튜디오" },
  { key: "history", label: "시청 기록" },
  { key: "account", label: "계정 관리" },
];

// ─── Shared styles ──────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r)",
  padding: 24,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 6,
  display: "block",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 16,
  color: "var(--text)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  background: "var(--bg2)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-sm)",
  color: "var(--text)",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: "var(--r-sm)",
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  cursor: "pointer",
};

const btnDangerStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: "var(--r-sm)",
  border: "1px solid #ef4444",
  background: "rgba(239,68,68,.15)",
  color: "#ef4444",
  cursor: "pointer",
};

// ─── Toast component ────────────────────────────────────────────────────────

function InlineToast({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: "var(--r-sm)",
        fontSize: 13,
        fontWeight: 500,
        background: isErr ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)",
        color: isErr ? "#ef4444" : "#22c55e",
        border: `1px solid ${isErr ? "rgba(239,68,68,.25)" : "rgba(34,197,94,.25)"}`,
      }}
    >
      {toast.message}
    </div>
  );
}

// ─── Profile tab ────────────────────────────────────────────────────────────

function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("프로필을 불러올 수 없습니다.");
        return r.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setNewUsername(data.username);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleSave() {
    if (!newUsername.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "닉네임 변경에 실패했습니다.");
      }
      setProfile((p) => (p ? { ...p, username: newUsername.trim() } : p));
      showToast({ type: "success", message: "닉네임이 변경되었습니다." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "오류가 발생했습니다.";
      showToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>불러오는 중...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#ef4444", fontSize: 14 }}>
          {error || "프로필 정보를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  const roleBadgeColor =
    profile.role === "ADMIN" ? "var(--accent)" : "var(--muted2)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>프로필 정보</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>닉네임</label>
          <input
            style={inputStyle}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            maxLength={30}
          />
        </div>

        {profile.email && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>이메일</label>
            <input
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
              value={profile.email}
              readOnly
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>역할</label>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "var(--r-sm)",
              background: `color-mix(in srgb, ${roleBadgeColor} 15%, transparent)`,
              color: roleBadgeColor,
              border: `1px solid color-mix(in srgb, ${roleBadgeColor} 30%, transparent)`,
            }}
          >
            {profile.role}
          </span>
        </div>

        {profile.createdAt && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>가입일</label>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text)",
              }}
            >
              {new Date(profile.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        <button
          type="button"
          style={{
            ...btnPrimaryStyle,
            opacity: saving ? 0.6 : 1,
            pointerEvents: saving ? "none" : "auto",
          }}
          onClick={handleSave}
        >
          {saving ? "저장 중..." : "닉네임 변경"}
        </button>

        <InlineToast toast={toast} />
      </div>
    </div>
  );
}

// ─── Password tab ───────────────────────────────────────────────────────────

function PasswordTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  }, []);

  function validate(): string | null {
    if (!currentPw) return "현재 비밀번호를 입력해주세요.";
    if (newPw.length < 8) return "새 비밀번호는 8자 이상이어야 합니다.";
    if (newPw !== confirmPw) return "새 비밀번호가 일치하지 않습니다.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      showToast({ type: "error", message: err });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "비밀번호 변경에 실패했습니다.");
      }
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      showToast({ type: "success", message: "비밀번호가 변경되었습니다." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "오류가 발생했습니다.";
      showToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={panelStyle}>
      <h2 style={sectionTitleStyle}>비밀번호 변경</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>현재 비밀번호</label>
          <input
            style={inputStyle}
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>새 비밀번호</label>
          <input
            style={inputStyle}
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            autoComplete="new-password"
            minLength={8}
          />
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted2)" }}>
            8자 이상 입력해주세요.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>새 비밀번호 확인</label>
          <input
            style={inputStyle}
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          style={{
            ...btnPrimaryStyle,
            opacity: saving ? 0.6 : 1,
            pointerEvents: saving ? "none" : "auto",
          }}
        >
          {saving ? "변경 중..." : "비밀번호 변경"}
        </button>

        <InlineToast toast={toast} />
      </form>
    </div>
  );
}

// ─── Subscription tab ───────────────────────────────────────────────────────

const TIER_INFO: Record<string, { name: string; features: string[] }> = {
  FREE: {
    name: "Free",
    features: [
      "광고 포함 시청",
      "720p 화질",
      "동시 1기기 시청",
    ],
  },
  BASIC: {
    name: "Basic",
    features: [
      "광고 없는 시청",
      "1080p Full HD",
      "동시 2기기 시청",
      "오프라인 다운로드",
    ],
  },
  PREMIUM: {
    name: "Premium",
    features: [
      "광고 없는 시청",
      "4K Ultra HD + HDR",
      "동시 4기기 시청",
      "오프라인 다운로드",
      "독점 콘텐츠 접근",
    ],
  },
};

function SubscriptionTab() {
  const { user } = useAuth();
  const tier = user?.subscriptionTier ?? "FREE";
  const info = TIER_INFO[tier] ?? TIER_INFO.FREE;

  return (
    <div style={panelStyle}>
      <h2 style={sectionTitleStyle}>구독 정보</h2>

      <div
        style={{
          padding: 20,
          borderRadius: "var(--r)",
          border: "1px solid var(--line2)",
          background: "var(--bg2)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {info.name}
          </span>
          <span
            style={{
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: "var(--r-sm)",
              background:
                tier === "PREMIUM"
                  ? "var(--grad-brand)"
                  : tier === "BASIC"
                    ? "rgba(139,92,246,.15)"
                    : "rgba(255,255,255,.08)",
              color:
                tier === "PREMIUM"
                  ? "#fff"
                  : tier === "BASIC"
                    ? "var(--accent)"
                    : "var(--muted)",
            }}
          >
            현재 구독
          </span>
        </div>

        <ul
          style={{
            margin: 0,
            padding: "0 0 0 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {info.features.map((f) => (
            <li
              key={f}
              style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}
            >
              {f}
            </li>
          ))}
        </ul>
      </div>

      {tier !== "PREMIUM" && (
        <Link
          href="/pricing"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: "var(--r-sm)",
            background: "var(--grad-brand)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          구독 업그레이드
        </Link>
      )}
    </div>
  );
}

// ─── Channels tab ───────────────────────────────────────────────────────────

function ChannelsTab() {
  const { locale } = useLocale();
  const [channels, setChannels] = useState<SubscribedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/me/subscriptions?lang=${locale}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error("구독 스튜디오를 불러올 수 없습니다.");
        return r.json();
      })
      .then((data: SubscribedChannel[]) => setChannels(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={sectionTitleStyle}>내 구독 스튜디오</h2>

      {channels.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          구독 중인 스튜디오가 없습니다.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          {channels.map((ch) => (
            <Link
              key={ch.id}
              href={`/studios/${ch.handle}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: "var(--r)",
                border: "1px solid var(--line)",
                background: "var(--bg2)",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color .15s",
              }}
            >
              {ch.profileImageUrl ? (
                <img
                  src={ch.profileImageUrl}
                  alt={ch.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--grad-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {ch.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ch.name}
                  </span>
                  {ch.isOfficial && (
                    <span
                      title="공식 스튜디오"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 8,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "var(--muted2)",
                  }}
                >
                  구독자 {ch.subscriberCount.toLocaleString()}명
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── History tab ────────────────────────────────────────────────────────────

function HistoryTab() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me/continue-watching", {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error("시청 기록을 불러올 수 없습니다.");
        return r.json();
      })
      .then((data: WatchHistoryItem[]) => setItems(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={sectionTitleStyle}>시청 기록</h2>

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          시청 기록이 없습니다.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const timeSec = Math.floor(item.positionMs / 1000);
            return (
              <Link
                key={item.contentId}
                href={`/watch/${item.contentId}?t=${timeSec}`}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: 10,
                  borderRadius: "var(--r-sm)",
                  background: "var(--bg2)",
                  border: "1px solid var(--line)",
                  textDecoration: "none",
                  color: "inherit",
                  alignItems: "center",
                  transition: "border-color .15s",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 120,
                    minWidth: 120,
                    aspectRatio: "16/9",
                    borderRadius: "var(--r-sm)",
                    overflow: "hidden",
                    background: "var(--panel2)",
                    flexShrink: 0,
                  }}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        color: "var(--muted2)",
                      }}
                    >
                      ▶
                    </div>
                  )}
                  {/* progress bar */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: "rgba(255,255,255,.15)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(item.progressPercent, 100)}%`,
                        background: "var(--accent)",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--muted2)",
                    }}
                  >
                    {Math.round(item.progressPercent)}% 시청
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Account tab ────────────────────────────────────────────────────────────

function AccountTab() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/me", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message ?? "계정 삭제에 실패했습니다.");
      }
      logout();
      router.push("/");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "오류가 발생했습니다.";
      showToast({ type: "error", message: msg });
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>계정 관리</h2>

        <div
          style={{
            padding: 20,
            borderRadius: "var(--r)",
            border: "1px solid rgba(239,68,68,.25)",
            background: "rgba(239,68,68,.05)",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 16,
              fontWeight: 700,
              color: "#ef4444",
            }}
          >
            계정 삭제
          </h3>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 14,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴
            수 없습니다. 업로드한 콘텐츠, 시청 기록, 구독 정보가 모두 삭제됩니다.
          </p>
          <button
            type="button"
            style={{
              ...btnDangerStyle,
              opacity: deleting ? 0.6 : 1,
              pointerEvents: deleting ? "none" : "auto",
            }}
            onClick={() => setConfirmOpen(true)}
          >
            {deleting ? "삭제 중..." : "계정 삭제"}
          </button>

          <InlineToast toast={toast} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="계정 삭제"
        message="정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구 삭제됩니다."
        confirmLabel="계정 삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  function renderTab() {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "password":
        return <PasswordTab />;
      case "subscription":
        return <SubscriptionTab />;
      case "channels":
        return <ChannelsTab />;
      case "history":
        return <HistoryTab />;
      case "account":
        return <AccountTab />;
    }
  }

  return (
    <>
      <style>{`
        .settings-layout {
          display: flex;
          gap: 28px;
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 20px;
        }
        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 180px;
          width: 180px;
          flex-shrink: 0;
        }
        .settings-tab {
          display: block;
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          color: var(--muted);
          background: transparent;
          border: none;
          border-left: 3px solid transparent;
          border-radius: 0 var(--r-sm) var(--r-sm) 0;
          cursor: pointer;
          text-align: left;
          transition: background .15s, color .15s, border-color .15s;
        }
        .settings-tab:hover {
          color: var(--text);
          background: rgba(255,255,255,.04);
        }
        .settings-tab[data-active="true"] {
          color: var(--accent);
          background: rgba(139,92,246,.08);
          border-left-color: var(--accent);
          font-weight: 600;
        }
        .settings-content {
          flex: 1;
          min-width: 0;
        }

        @media (max-width: 767px) {
          .settings-layout {
            flex-direction: column;
            gap: 16px;
            padding: 16px 12px;
          }
          .settings-sidebar {
            flex-direction: row;
            min-width: unset;
            width: 100%;
            overflow-x: auto;
            gap: 6px;
            padding-bottom: 4px;
          }
          .settings-sidebar::-webkit-scrollbar {
            display: none;
          }
          .settings-tab {
            white-space: nowrap;
            border-left: none;
            border-bottom: 2px solid transparent;
            border-radius: var(--r-sm);
            padding: 8px 14px;
            font-size: 13px;
            background: var(--panel);
            border: 1px solid var(--line);
          }
          .settings-tab[data-active="true"] {
            border-color: var(--accent);
            background: rgba(139,92,246,.12);
          }
        }
      `}</style>

      <div className="settings-layout">
        <h1
          style={{
            display: "none",
          }}
        >
          계정 설정
        </h1>

        <nav className="settings-sidebar" aria-label="설정 탭">
          <h1
            style={{
              margin: "0 0 12px",
              padding: "0 14px",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            계정 설정
          </h1>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="settings-tab"
              data-active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="settings-content">{renderTab()}</main>
      </div>
    </>
  );
}
