"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function dismiss(analytics: boolean) {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics, ts: Date.now() }));
      setVisible(false);
    }, 300);
  }

  if (!visible) return null;

  return (
    <>
      {/* 인라인 keyframes — globals.css 수정 없이 독립 동작 */}
      <style>{`
        @keyframes cookie-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes cookie-slide-down {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
      `}</style>

      <div
        role="dialog"
        aria-label="쿠키 사용 동의"
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          animation: closing
            ? "cookie-slide-down 0.3s ease-in forwards"
            : "cookie-slide-up 0.4s ease-out forwards",
        }}
      >
        {/* 상단 그라데이션 — 페이지와 자연스럽게 연결 */}
        <div className="h-6 bg-gradient-to-t from-zinc-900/95 to-transparent pointer-events-none" />

        <div className="bg-zinc-900/95 backdrop-blur-md border-t border-white/10">
          <div className="max-w-5xl mx-auto px-5 py-5 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* 아이콘 + 텍스트 */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-2xl leading-none mt-0.5 shrink-0" aria-hidden="true">
                  🍪
                </span>
                <p className="text-sm text-gray-300 leading-relaxed">
                  서비스 개선을 위해 쿠키를 사용합니다. 로그인 유지에 필요한 필수 쿠키는 항상
                  활성화되며, 분석 쿠키는 선택적으로 동의하실 수 있습니다.{" "}
                  <Link
                    href="/legal/privacy"
                    className="text-purple-400 underline underline-offset-2 hover:text-purple-300 transition-colors"
                  >
                    개인정보처리방침
                  </Link>
                </p>
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-3 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => dismiss(false)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-sm rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 text-gray-200 transition-all cursor-pointer"
                >
                  필수만 허용
                </button>
                <button
                  onClick={() => dismiss(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-sm rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all cursor-pointer"
                >
                  모두 허용
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
