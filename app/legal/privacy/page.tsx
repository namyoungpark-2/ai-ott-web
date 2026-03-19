import Link from "next/link";

export const metadata = { title: "개인정보처리방침 | AI-OTT" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-2">개인정보처리방침</h1>
        <p className="text-gray-400 text-sm mb-12">최종 업데이트: 2026년 3월 19일</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. 개인정보 수집 항목</h2>
            <p className="mb-3">AI-OTT는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">필수 항목</strong>: 이메일 주소, 비밀번호(암호화 저장), 닉네임</li>
              <li><strong className="text-white">결제 정보</strong>: 결제 수단 정보(카드사 및 결제 대행사에서 직접 처리, 당사 서버에 저장하지 않음)</li>
              <li><strong className="text-white">자동 수집</strong>: IP 주소, 브라우저 종류, 접속 일시, 서비스 이용 기록, 시청 기록</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. 개인정보 수집 및 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>회원 가입 및 서비스 이용 관리</li>
              <li>구독 결제 및 환불 처리</li>
              <li>콘텐츠 추천 및 시청 이력 제공</li>
              <li>고객 지원 및 불만 처리</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>법령 및 이용약관 위반 행위 방지</li>
              <li>공지사항 전달 및 마케팅 커뮤니케이션(동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. 개인정보 보유 및 이용 기간</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">회원 정보</strong>: 탈퇴 시까지 (탈퇴 후 30일 이내 파기)</li>
              <li><strong className="text-white">결제 기록</strong>: 전자상거래법에 따라 5년 보관</li>
              <li><strong className="text-white">서비스 이용 기록</strong>: 3개월</li>
              <li><strong className="text-white">법적 의무 이행</strong>: 관련 법령에서 정한 기간까지 보관</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. 개인정보의 제3자 제공</h2>
            <p className="mb-3">
              당사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령이 정한 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. 개인정보 처리 위탁</h2>
            <p className="mb-3">당사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/10">
                    <th className="text-left p-3 text-white font-semibold">수탁업체</th>
                    <th className="text-left p-3 text-white font-semibold">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/10">
                    <td className="p-3">Stripe, Inc.</td>
                    <td className="p-3">결제 처리 및 구독 관리</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-3">Cloudflare, Inc.</td>
                    <td className="p-3">콘텐츠 전송 및 보안</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-3">Render Services, Inc.</td>
                    <td className="p-3">서버 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. 쿠키(Cookie) 사용</h2>
            <p className="mb-3">
              당사는 서비스 제공을 위해 쿠키를 사용합니다. 쿠키는 웹사이트가 브라우저에 저장하는 소량의 텍스트 파일입니다.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">필수 쿠키</strong>: 로그인 상태 유지, 보안 인증에 필요하며 거부 시 서비스 이용이 불가합니다.</li>
              <li><strong className="text-white">분석 쿠키</strong>: 서비스 이용 패턴 분석 및 개선에 사용됩니다. 동의를 통해 허용 여부를 선택할 수 있습니다.</li>
            </ul>
            <p className="mt-3">
              브라우저 설정을 통해 쿠키를 거부할 수 있으나, 이 경우 서비스 일부 기능 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. 정보주체의 권리</h2>
            <p className="mb-3">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>개인정보 열람 요청</li>
              <li>오류 등이 있을 경우 정정 요청</li>
              <li>삭제 요청</li>
              <li>처리 정지 요청</li>
              <li>데이터 이동(이식성) 요청 (GDPR 적용 대상자)</li>
            </ul>
            <p className="mt-3">
              위 권리 행사는 아래 이메일 또는 계정 설정 페이지에서 직접 진행할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. 개인정보 안전성 확보 조치</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>비밀번호 암호화(bcrypt) 저장</li>
              <li>전송 구간 SSL/TLS 암호화 적용</li>
              <li>접근 권한 최소화 및 내부 관리 절차 수립</li>
              <li>정기적인 보안 점검 시행</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. 국외 이전</h2>
            <p>
              당사는 서비스 제공을 위해 개인정보를 국외로 이전합니다. Stripe(미국), Cloudflare(미국)
              등 해외 처리업체에 결제 및 네트워크 서비스를 위탁하고 있으며, 각 업체는 GDPR 표준
              계약 조항 등 적절한 안전장치를 갖추고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. 개인정보 보호책임자</h2>
            <p className="mb-3">개인정보 처리에 관한 업무를 총괄하는 책임자 정보는 아래와 같습니다.</p>
            <ul className="list-none space-y-1">
              <li><strong className="text-white">성명</strong>: AI-OTT 개인정보 보호팀</li>
              <li><strong className="text-white">이메일</strong>:{" "}
                <a href="mailto:privacy@ai-ott.com" className="text-purple-400 hover:underline">
                  privacy@ai-ott.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. 개정 이력</h2>
            <p>
              본 방침은 2026년 3월 19일에 최초 작성되었습니다. 내용이 변경될 경우 변경 7일 전에
              서비스 내 공지사항을 통해 사전 안내합니다.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
          <Link href="/legal/terms" className="text-purple-400 hover:underline text-sm">
            이용약관 →
          </Link>
          <Link href="/" className="text-gray-500 hover:text-white text-sm">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
