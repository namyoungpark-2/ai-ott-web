import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl mb-6">↩️</div>
        <h1 className="text-3xl font-black mb-4">결제가 취소되었습니다</h1>
        <p className="text-gray-400 mb-8">
          언제든지 다시 구독을 시작할 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors"
          >
            플랜 다시 보기
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </main>
  );
}
