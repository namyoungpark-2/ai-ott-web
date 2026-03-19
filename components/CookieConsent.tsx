"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: true, ts: Date.now() }));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: false, ts: Date.now() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="쿠키 사용 동의"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-zinc-900 border-t border-white/10 shadow-xl"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-gray-300 leading-relaxed">
          저희는 서비스 개선을 위해 쿠키를 사용합니다. 로그인 유지에 필요한 필수 쿠키는 항상
          활성화되며, 분석 쿠키는 선택적으로 동의하실 수 있습니다.{" "}
          <Link href="/legal/privacy" className="text-purple-400 underline hover:text-purple-300">
            개인정보처리방침
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            필수만 허용
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
          >
            모두 허용
          </button>
        </div>
      </div>
    </div>
  );
}
