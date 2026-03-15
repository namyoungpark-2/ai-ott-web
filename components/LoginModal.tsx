"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";

type Props = { onClose: () => void };
type Tab = "login" | "signup";

export default function LoginModal({ onClose }: Props) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  // 모달 열리면 포커스
  useEffect(() => {
    usernameRef.current?.focus();
  }, [tab]);

  // ESC 키로 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (tab === "signup") {
      if (password.length < 4) {
        setError("비밀번호는 4자 이상이어야 합니다.");
        return;
      }
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    setSubmitting(true);
    setError("");
    const result =
      tab === "login"
        ? await login(username.trim(), password)
        : await signup(username.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  const isLogin = tab === "login";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? "로그인" : "회원가입"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.72)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "var(--shadow)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22 }}>{isLogin ? "로그인" : "회원가입"}</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 20,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            marginBottom: 24,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--line)",
          }}
        >
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                border: "none",
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#fff" : "var(--muted)",
                fontWeight: tab === t ? 700 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              htmlFor="login-username"
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              아이디
            </label>
            <input
              id="login-username"
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={submitting}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={submitting}
              style={{ width: "100%" }}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="login-confirm-password"
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                비밀번호 확인
              </label>
              <input
                id="login-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                style={{ width: "100%" }}
              />
            </div>
          )}

          {error && (
            <p
              role="alert"
              style={{ color: "#ff6b6b", fontSize: 13, margin: 0 }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              background: "var(--accent)",
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? isLogin
                ? "로그인 중..."
                : "가입 중..."
              : isLogin
              ? "로그인"
              : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
