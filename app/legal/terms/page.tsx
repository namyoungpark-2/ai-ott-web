import Link from "next/link";

export const metadata = { title: "이용약관 | AI-OTT" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">이용약관</h1>
        <p className="text-gray-400 text-sm mb-12">최종 업데이트: 2026년 3월 19일</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. 서비스 이용 동의</h2>
            <p>
              AI-OTT 서비스(이하 "서비스")를 이용하시면 본 이용약관에 동의하는 것으로 간주됩니다.
              본 약관에 동의하지 않으시면 서비스를 이용하실 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. 서비스 설명</h2>
            <p>
              AI-OTT는 온라인 동영상 스트리밍 서비스입니다. 구독 플랜에 따라 다양한 콘텐츠를
              시청할 수 있으며, 일부 콘텐츠는 유료 구독이 필요합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. 계정 및 회원가입</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>서비스 이용을 위해 계정을 생성해야 합니다.</li>
              <li>정확하고 최신의 정보를 제공해야 합니다.</li>
              <li>계정 보안(비밀번호 등)은 회원 본인이 책임집니다.</li>
              <li>타인의 계정을 무단으로 사용할 수 없습니다.</li>
              <li>만 14세 미만은 서비스를 이용할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. 구독 및 결제</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>구독 요금은 선택한 플랜에 따라 매월 자동으로 결제됩니다.</li>
              <li>구독은 언제든지 취소할 수 있으며, 다음 결제일까지 서비스를 이용할 수 있습니다.</li>
              <li>환불은 결제일로부터 7일 이내에 요청할 수 있습니다.</li>
              <li>플랜 변경은 즉시 적용되며, 차액은 자동으로 조정됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. 콘텐츠 이용 규칙</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>콘텐츠는 개인적인 용도로만 시청할 수 있습니다.</li>
              <li>콘텐츠를 무단으로 복제, 배포, 공유하는 것은 금지됩니다.</li>
              <li>VPN을 통한 지역 제한 우회는 허용되지 않습니다.</li>
              <li>동시 시청 기기 수는 구독 플랜에 따라 제한됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. 서비스 변경 및 중단</h2>
            <p>
              당사는 서비스의 일부 또는 전부를 사전 통보 없이 변경하거나 중단할 수 있습니다.
              다만, 유료 서비스 중단 시에는 최소 30일 전에 공지하고 잔여 기간에 대한 환불을 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. 금지 행위</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>서비스의 보안 시스템 우회 시도</li>
              <li>자동화된 방법으로 대량의 요청 전송</li>
              <li>다른 사용자의 이용을 방해하는 행위</li>
              <li>불법적이거나 유해한 콘텐츠 업로드</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. 책임 제한</h2>
            <p>
              당사는 서비스 이용으로 인한 직접적, 간접적 손해에 대해 법률이 허용하는 최대 범위까지
              책임을 제한합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. 분쟁 해결</h2>
            <p>
              본 약관은 대한민국 법률에 따라 해석됩니다. 분쟁 발생 시 먼저 당사에 문의하여
              해결을 시도하며, 협의가 이루어지지 않을 경우 대한민국 법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. 문의</h2>
            <p>이용약관에 관한 문의는 아래 이메일로 연락해주세요.</p>
            <p className="mt-2">
              <a href="mailto:support@ai-ott.com" className="text-purple-400 hover:underline">
                support@ai-ott.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/legal/privacy" className="text-purple-400 hover:underline text-sm">
            개인정보처리방침 →
          </Link>
          <Link href="/" className="text-gray-500 hover:text-white text-sm">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
