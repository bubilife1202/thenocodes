import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "시나리오 #1 — flaky timezone test · 더노코즈",
};

export default function Scenario01Page() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="divide-y divide-[#ECE7DF]">

        {/* Header */}
        <div className="pb-8">
          <p className="mb-2 text-xs font-semibold text-[#0F766E]">시나리오 #1</p>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B] sm:text-3xl">
            flaky timezone test —{" "}
            <span className="font-medium text-[#6B6760]">깨진 미팅 날짜 포매터 고치기</span>
          </h1>
        </div>

        {/* 상황 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">상황 (Situation)</h2>
          <div className="space-y-3 text-sm text-[#6B6760]">
            <p>
              더노코즈 밋업 페이지에 붙은{" "}
              <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">formatMeetupDate()</code>{" "}
              유틸이 최근 QA에서 &quot;날짜가 이상하다&quot;는 제보를 받았습니다.
              테스트 3개 중 1개가 실패합니다.
            </p>
            <p>
              AI와 함께 원인을 찾고 고치세요. 단, 통과하는 테스트 2개는 버그를 가리고 있습니다 — 거기까지 찾아야 합니다.
            </p>
          </div>
        </div>

        {/* 미션 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">당신의 미션 (Deliverables)</h2>
          <ol className="space-y-3 text-sm text-[#6B6760]">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-[10px] font-bold text-white">1</span>
              <span>
                <strong className="font-semibold text-[#18181B]">실패하는 테스트를 통과시키는 최소 수정.</strong>{" "}
                나머지 테스트가 깨지면 안 됩니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-[10px] font-bold text-white">2</span>
              <span>
                <strong className="font-semibold text-[#18181B]">숨어있는 버그를 찾아라.</strong>{" "}
                통과하는 테스트 2개는 버그를 가리고 있습니다. 발견하지 못하면 다음 QA에서 고객이 먼저 발견할 것입니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-[10px] font-bold text-white">3</span>
              <span>
                <strong className="font-semibold text-[#18181B]">PR diff + 1장 분량 회고록 + 프롬프트 로그.</strong>{" "}
                AI에게 무엇을 물었는지, AI가 무엇을 틀렸는지, 어떻게 발견했는지, 최종적으로 무엇을 바꿨는지 기록합니다.
              </span>
            </li>
          </ol>
        </div>

        {/* 제출 방법 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">제출 방법 (How to submit)</h2>
          <div className="space-y-2 text-sm text-[#6B6760]">
            <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wide">출시 전 — 수동 제출</p>
            <ol className="space-y-2 pl-1">
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-[#18181B]">1.</span>
                Gumroad 사전 구매 확정 이메일을 받은 뒤 제출 창구가 열립니다.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-[#18181B]">2.</span>
                PR diff (<code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">.patch</code> 또는 GitHub PR 링크) + 회고록 + 프롬프트 로그를 이메일 첨부로 보냅니다.
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold text-[#18181B]">3.</span>
                채점 결과는 이메일로 회신됩니다.
              </li>
            </ol>
            <p className="mt-2 text-xs text-[#A1A1AA]">출시 후 제출 파이프라인 구축 예정.</p>
          </div>
        </div>

        {/* 프롬프트 로그 템플릿 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">프롬프트 로그 템플릿</h2>
          <p className="mb-4 text-sm text-[#6B6760]">
            <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">PROMPT_LOG_TEMPLATE.md</code>를 복사해서 채웁니다.
            Claude Code, Cursor, ChatGPT, Gemini 어떤 도구를 쓰든 통일된 포맷으로 기록합니다.
          </p>
          <div className="rounded-lg border border-[#ECE7DF] bg-[#F8F5F0] p-4">
            <p className="mb-2 text-xs font-semibold text-[#6B6760] uppercase tracking-wide">필수 헤딩 6개</p>
            <ol className="space-y-1.5 text-sm text-[#18181B]">
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>목표 (Goal)</strong> — 이 세션에서 달성하려는 것</span>
              </li>
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>컨텍스트 (Context)</strong> — 첨부한 코드·에러 메시지 요약</span>
              </li>
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>프롬프트 교환 (Exchanges)</strong> — 프롬프트 / AI 응답 / 검증 결과 순으로 라운드별 기록</span>
              </li>
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>AI가 틀렸던 지점 (AI Errors)</strong> — 틀린 부분과 어떻게 발견했는지</span>
              </li>
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>최종 diff 근거 (Rationale)</strong> — 최종 변경을 선택한 이유</span>
              </li>
              <li className="flex gap-2">
                <code className="w-6 shrink-0 font-mono text-xs text-[#0F766E]">##</code>
                <span><strong>회고 (Reflection)</strong> — 다음에 다르게 할 것</span>
              </li>
            </ol>
          </div>
        </div>

        {/* 채점 기준 요약 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">채점 기준 요약</h2>
          <p className="mb-4 text-sm text-[#6B6760]">
            3개 축 × L1~L4. 전체 루브릭은{" "}
            <Link href="/scenarios/rubric" className="text-[#0F766E] hover:underline">
              /scenarios/rubric
            </Link>
            에서 확인하세요.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#ECE7DF]">
                  <th className="pb-2 pr-4 text-left font-semibold text-[#18181B]">축</th>
                  <th className="pb-2 pr-4 text-left font-semibold text-[#18181B]">L1 (미충족)</th>
                  <th className="pb-2 pr-4 text-left font-semibold text-[#18181B]">L2 (부분)</th>
                  <th className="pb-2 pr-4 text-left font-semibold text-[#18181B]">L3 (충족)</th>
                  <th className="pb-2 text-left font-semibold text-[#18181B]">L4 (탁월)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0EB]">
                <tr>
                  <td className="py-2 pr-4 font-semibold text-[#18181B]">Collaboration<br /><span className="font-normal text-[#A1A1AA]">협업</span></td>
                  <td className="py-2 pr-4 text-[#6B6760]">God-prompt 1개</td>
                  <td className="py-2 pr-4 text-[#6B6760]">≥2 교환, 수용 기준 없음</td>
                  <td className="py-2 pr-4 text-[#6B6760]">≥2 서브-태스크, 코드 첨부, 기준 명시</td>
                  <td className="py-2 text-[#6B6760]">사전 계획 선언 + 명시적 리다이렉션</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-semibold text-[#18181B]">Verification<br /><span className="font-normal text-[#A1A1AA]">검증</span></td>
                  <td className="py-2 pr-4 text-[#6B6760]">AI 출력 그대로 제출</td>
                  <td className="py-2 pr-4 text-[#6B6760]">테스트 실행만, 엣지케이스 없음</td>
                  <td className="py-2 pr-4 text-[#6B6760]">diff 직독 + 경계 케이스 탐색 + 기록</td>
                  <td className="py-2 text-[#6B6760]">독립 신호(다른 모델·직접 열거)로 교차 확인</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-semibold text-[#18181B]">Improvement<br /><span className="font-normal text-[#A1A1AA]">개선</span></td>
                  <td className="py-2 pr-4 text-[#6B6760]">AI 첫 답변 그대로</td>
                  <td className="py-2 pr-4 text-[#6B6760]">반복 있으나 미수렴</td>
                  <td className="py-2 pr-4 text-[#6B6760]">≥2 라운드, 검증 결과를 다음 프롬프트에 통합</td>
                  <td className="py-2 text-[#6B6760]">숨은 버그 수정 + 예방적 회귀 테스트 추가</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 참고 */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">참고</h2>
          <p className="text-sm text-[#6B6760]">
            이 리포는 현재 더노코즈 메인 레포의{" "}
            <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">scenarios/scenario-01-timezone/</code>{" "}
            서브트리에 있습니다. 향후 standalone 리포로 이전 예정입니다.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="py-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/scenarios"
              className="rounded-lg border border-[#ECE7DF] px-4 py-2 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
            >
              ← /scenarios 돌아가기
            </Link>
            <a
              href="/scenarios#waitlist"
              className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B5F58]"
            >
              사전 구매하기
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
