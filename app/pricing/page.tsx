"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Plan = {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  tier: "FREE" | "BASIC" | "PREMIUM";
  features: string[];
  cta: string;
  highlighted: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "무료",
    price: "₩0",
    priceNote: "영원히 무료",
    tier: "FREE",
    features: [
      "무료 콘텐츠 무제한 시청",
      "광고 포함",
      "SD 화질",
      "1개 기기 동시 시청",
    ],
    cta: "현재 플랜",
    highlighted: false,
  },
  {
    id: "basic",
    name: "베이직",
    price: "₩9,900",
    priceNote: "/ 월",
    tier: "BASIC",
    features: [
      "무료 + BASIC 콘텐츠 전부",
      "광고 없음",
      "HD 화질 (1080p)",
      "2개 기기 동시 시청",
      "다운로드 기능",
    ],
    cta: "베이직 시작하기",
    highlighted: false,
  },
  {
    id: "premium",
    name: "프리미엄",
    price: "₩14,900",
    priceNote: "/ 월",
    tier: "PREMIUM",
    features: [
      "모든 콘텐츠 무제한 시청",
      "광고 완전 제거",
      "4K + HDR 화질",
      "4개 기기 동시 시청",
      "다운로드 기능",
      "신규 콘텐츠 최우선 접근",
      "독점 AI 추천",
    ],
    cta: "프리미엄 시작하기",
    highlighted: true,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(plan: Plan) {
    if (plan.tier === "FREE") return;

    if (!user) {
      router.push("/login?next=/pricing");
      return;
    }

    if (user.subscriptionTier === plan.tier) return;

    setLoading(plan.id);
    setError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: plan.tier }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "결제 페이지를 열 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      // Stripe Hosted Checkout 페이지로 이동
      window.location.href = data.url;
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(null);
    }
  }

  const currentTier = user?.subscriptionTier ?? "FREE";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">구독 플랜 선택</h1>
          <p className="text-gray-400 text-lg">
            언제든지 취소할 수 있습니다. 첫 달 무료 체험.
          </p>
        </div>

        {/* 플랜 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            const isHigherTier =
              ["FREE", "BASIC", "PREMIUM"].indexOf(plan.tier) >
              ["FREE", "BASIC", "PREMIUM"].indexOf(currentTier);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  plan.highlighted
                    ? "border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/20"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    가장 인기
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-gray-400 text-sm mb-1">{plan.priceNote}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || loading === plan.id || (!isHigherTier && plan.tier !== "FREE")}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    isCurrent
                      ? "bg-white/10 text-gray-500 cursor-default"
                      : plan.highlighted
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id
                    ? "처리 중..."
                    : isCurrent
                    ? "현재 플랜"
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="text-center text-red-400 text-sm mb-6">{error}</div>
        )}

        {/* FAQ */}
        <div className="mt-16 border-t border-white/10 pt-12">
          <h2 className="text-2xl font-bold mb-8 text-center">자주 묻는 질문</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "언제든지 취소할 수 있나요?",
                a: "네, 언제든지 취소할 수 있습니다. 다음 결제일까지 서비스를 계속 이용할 수 있습니다.",
              },
              {
                q: "결제 수단은 무엇을 지원하나요?",
                a: "신용카드, 체크카드, 카카오페이 등 주요 결제 수단을 지원합니다.",
              },
              {
                q: "기기 변경이 가능한가요?",
                a: "언제든지 계정에 로그인하여 다른 기기에서 이용할 수 있습니다.",
              },
              {
                q: "플랜 업그레이드/다운그레이드가 가능한가요?",
                a: "언제든지 플랜을 변경할 수 있으며, 차액은 자동으로 조정됩니다.",
              },
            ].map((item) => (
              <div key={item.q} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
