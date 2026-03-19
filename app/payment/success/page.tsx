"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  // 결제 완료 후 쿠키의 구독 정보가 갱신될 때까지 잠깐 대기
  // 실제로는 다음 로그인 시 새 JWT에 구독 정보가 반영됨
  useEffect(() => {
    // 3초 후 홈으로 이동
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black mb-4">결제가 완료되었습니다!</h1>
        <p className="text-gray-400 mb-2">
          구독이 활성화되었습니다. 프리미엄 콘텐츠를 즐겨보세요.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          새로운 혜택을 적용하려면 다시 로그인해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors"
          >
            홈으로 가기
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
          >
            다시 로그인
          </Link>
        </div>
        <p className="text-gray-600 text-xs mt-6">잠시 후 자동으로 홈으로 이동합니다.</p>
      </div>
    </main>
  );
}
