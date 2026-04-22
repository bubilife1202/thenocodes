import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "채점 루브릭 · 더노코즈 AI-Assisted Scenario",
};

export default function RubricPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="divide-y divide-[#ECE7DF]">

        {/* Header */}
        <div className="pb-8">
          <p className="mb-2 text-xs font-medium text-[#A1A1AA]">더노코즈 AI-Assisted Scenario</p>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B]">채점 루브릭</h1>
          <p className="mt-1 text-sm text-[#6B6760]">v2.0 · 2026-04-22</p>
        </div>

        {/* External grader warning */}
        <div className="py-6">
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            <p className="font-semibold">외부 채점자 운영성 확인 (TN-V2-P2)</p>
            <p className="mt-1 text-orange-800">
              채점은 사람이 직접 수행합니다. 이 루브릭은 GRADED_WALKTHROUGH 공개 전 외부 채점자 ≥1명이 독립 채점을 완료해야 하며, 축별 차이 &gt;1레벨이 있으면 앵커 보강 후 재시도합니다.
            </p>
          </div>
        </div>

        {/* Overview */}
        <div className="py-8">
          <h2 className="mb-3 text-sm font-bold text-[#18181B]">루브릭 개요</h2>
          <div className="space-y-2 text-sm text-[#6B6760]">
            <p>
              채점 대상은 <strong className="font-semibold text-[#18181B]">과정(process)</strong>이며, 결과물(diff) 자체의 완성도가 아닙니다. 테스트 통과 여부는 시나리오 합격/불합격 기준이고, 루브릭은 그 결과에 이르는 방식을 평가합니다.
            </p>
            <ul className="space-y-1 pl-3">
              <li>• <strong className="text-[#18181B]">3개 축:</strong> Collaboration · Verification · Improvement</li>
              <li>• <strong className="text-[#18181B]">레벨 범위:</strong> 각 축 L1–L4. 제출물 1개의 총합 범위 = L3(최저) ~ L12(최고)</li>
              <li>• 총점보다 <strong className="text-[#18181B]">축별 레벨</strong>이 의미 있는 신호입니다. &quot;L12&quot;보다 &quot;V-L4, C-L2&quot; 쪽이 피드백으로 유용합니다.</li>
              <li>• <strong className="text-[#18181B]">왜 LLM이 채점하지 않는가:</strong> AI-assisted 결과물을 AI가 채점하면 재귀 함정이 생깁니다. 루브릭 v2는 사람이 전적으로 채점합니다.</li>
            </ul>
          </div>
        </div>

        {/* Axis A: Collaboration */}
        <div className="py-8">
          <div className="mb-5">
            <p className="text-xs font-semibold text-[#0F766E]">Axis A</p>
            <h2 className="text-lg font-bold text-[#18181B]">Collaboration <span className="text-sm font-normal text-[#6B6760]">협업</span></h2>
            <p className="mt-2 text-sm text-[#6B6760]">
              학습자가 AI를 어떻게 지휘했는가. 태스크를 단계별로 분해했는지, 문맥을 충분히 첨부했는지, 목표와 제약을 명시했는지를 측정합니다. &quot;학습자가 상호작용을 이끌었는가, 아니면 AI에게 수동적으로 끌려갔는가?&quot;
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="mb-2 text-xs font-bold text-red-700">L1 — 미충족</p>
              <ul className="space-y-1.5 text-xs text-red-900">
                <li>• 문제 전체를 한 번에 던지는 god-prompt 1개 제출. 분해 없음, 제약 없음, 수용 기준 없음. 프롬프트 로그에 교환이 1개.</li>
                <li>• 프롬프트 로그가 없거나 AI 출력만 있어 학습자가 어떻게 지휘했는지 확인 불가.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="mb-2 text-xs font-bold text-orange-700">L2 — 부분 충족</p>
              <ul className="space-y-1.5 text-xs text-orange-900">
                <li>• ≥2 교환으로 분리했지만 각 단계의 수용 기준이 없음. 프롬프트가 에러 메시지 붙여넣기 수준.</li>
                <li>• 일부 컨텍스트를 첨부했지만 핵심 제약(어느 테스트가 통과해야 하는지 등)이 빠져 AI가 가정으로 채워야 함.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="mb-2 text-xs font-bold text-teal-700">L3 — 충족</p>
              <ul className="space-y-1.5 text-xs text-teal-900">
                <li>• ≥2 서브-프롬프트, 각 단계에 명시적 수용 기준 포함. 관련 코드 스니펫 또는 테스트 출력을 직접 첨부.</li>
                <li>• 적어도 1개 프롬프트에서 수정이 건드리면 안 되는 범위를 명시하거나, 코드 전에 설명을 요청.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="mb-2 text-xs font-bold text-green-700">L4 — 탁월</p>
              <ul className="space-y-1.5 text-xs text-green-900">
                <li>• 첫 코드 생성 프롬프트 전에 순서화된 계획을 프롬프트 로그에 선언. 각 프롬프트가 이전 검증 결과를 바탕으로 구성됨.</li>
                <li>• AI 오해를 반례 또는 구체적 실패 케이스로 수정 — 단순히 &quot;다시 해봐&quot;가 아닌 명시적 리다이렉션.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Axis B: Verification */}
        <div className="py-8">
          <div className="mb-5">
            <p className="text-xs font-semibold text-[#0F766E]">Axis B</p>
            <h2 className="text-lg font-bold text-[#18181B]">Verification <span className="text-sm font-normal text-[#6B6760]">검증</span></h2>
            <p className="mt-2 text-sm text-[#6B6760]">
              학습자가 AI 출력을 수락하기 전에 어떻게 검증했는가. 테스트 실행, diff 직접 검토, 엣지케이스 탐색, 독립 신호 사용(다른 모델, 수동 추적, 역방향 테스트)을 측정합니다. &quot;학습자가 제출 전에 AI 오류를 잡았는가?&quot;
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="mb-2 text-xs font-bold text-red-700">L1 — 미충족</p>
              <ul className="space-y-1.5 text-xs text-red-900">
                <li>• AI 첫 출력을 테스트 실행이나 diff 검토 없이 수락. 제출 결과물이 AI 응답의 복붙.</li>
                <li>• 회고에서 테스트 실패를 인지했지만 다른 실패 모드가 있는지는 확인하지 않음.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="mb-2 text-xs font-bold text-orange-700">L2 — 부분 충족</p>
              <ul className="space-y-1.5 text-xs text-orange-900">
                <li>• AI 제안 후 테스트 스위트를 실행해 pass/fail 확인. 그 이상의 검증 없음 — diff 검토, 엣지케이스 탐색 없음.</li>
                <li>• 특정 입력 케이스를 수동 확인했지만 검증 추론이 기록되지 않아 체계적인지 알 수 없음.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="mb-2 text-xs font-bold text-teal-700">L3 — 충족</p>
              <ul className="space-y-1.5 text-xs text-teal-900">
                <li>• 전체 테스트 스위트 실행 AND diff 라인별 직독. 회고에서 AI 제안의 특정 리스크 1개 이상 식별.</li>
                <li>• 기존 테스트가 커버하지 않는 경계 조건 ≥1개를 탐색하고, 결과를 문서화(버그 없어도 기록).</li>
              </ul>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="mb-2 text-xs font-bold text-green-700">L4 — 탁월</p>
              <ul className="space-y-1.5 text-xs text-green-900">
                <li>• 제출 전에 AI 오류 ≥1개를 발견하고, 실패 모드를 문서화한 뒤 독립 신호(다른 모델, 수동 추적, adversarial 테스트)로 수정을 검증.</li>
                <li>• 기존 테스트 스위트가 빠뜨린 케이스를 체계적으로 커버하는 경계 탐색 테스트 또는 입력 매트릭스 구성. 어떤 케이스를 선택했는지 이유와 함께 기록.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Axis C: Improvement */}
        <div className="py-8">
          <div className="mb-5">
            <p className="text-xs font-semibold text-[#0F766E]">Axis C</p>
            <h2 className="text-lg font-bold text-[#18181B]">Improvement <span className="text-sm font-normal text-[#6B6760]">개선</span></h2>
            <p className="mt-2 text-sm text-[#6B6760]">
              학습자가 AI 출력이 잘못되거나 불완전할 때 어떻게 반복 개선했는가. 여러 라운드의 수렴, 검증 결과를 다음 프롬프트에 통합, 최종 결과물이 단순한 AI 첫 초안 이상인지를 측정합니다. &quot;최종 결과물이 이유 있는 반복의 산물인가, AI 첫 답변의 재포장인가?&quot;
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="mb-2 text-xs font-bold text-red-700">L1 — 미충족</p>
              <ul className="space-y-1.5 text-xs text-red-900">
                <li>• AI 첫 번째 또는 두 번째 시도를 수정 없이 제출. 최종 diff가 실패 테스트만 고치고 숨은 버그는 남아있음.</li>
                <li>• 회고가 AI가 만든 것을 설명하지만 학습자가 무엇을 바꿨는지, 왜 바꿨는지, 무엇을 배웠는지는 없음.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
              <p className="mb-2 text-xs font-bold text-orange-700">L2 — 부분 충족</p>
              <ul className="space-y-1.5 text-xs text-orange-900">
                <li>• ≥1 라운드 반복했지만 수렴하지 않음. 최종 제출이 AI 두 번째 시도의 재포장. 검증 결과를 다음 프롬프트에 통합하지 않음.</li>
                <li>• 프롬프트 로그에 수정 ≥1 라운드가 있지만 최종 diff가 알려진 문제를 남기거나 통과 테스트를 되돌림.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="mb-2 text-xs font-bold text-teal-700">L3 — 충족</p>
              <ul className="space-y-1.5 text-xs text-teal-900">
                <li>• ≥2 개별 수정 라운드. 각 새 프롬프트가 이전 검증 결과를 명시적으로 반영함 (예: &quot;이전 수정이 DST 경계를 깼다 — 구체적 실패 입력을 AI에게 주고 재접근 요청&quot;). 최종 diff가 이 반복에 추적 가능.</li>
                <li>• 회고에서 AI 출력을 학습자 자신의 이해를 바탕으로 수정하거나 거부한 ≥1 지점을 명시적으로 설명.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <p className="mb-2 text-xs font-bold text-green-700">L4 — 탁월</p>
              <ul className="space-y-1.5 text-xs text-green-900">
                <li>• 최종 diff가 식별된 버그를 모두 수정하고 숨은 버그에 대한 회귀 테스트를 추가. 테스트 의도가 주석 또는 회고에 문서화됨 — 증상 패치가 아닌 실패 모드 이해를 보여줌.</li>
                <li>• 회고가 단일 AI 제안을 넘는 합성을 보여줌: 코드베이스 맥락(제약, 호출 위치, 유지보수성)에 근거한 설계 선택 설명. 선호가 아닌 근거.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Grading Protocol */}
        <div className="py-8">
          <h2 className="mb-4 text-sm font-bold text-[#18181B]">채점 프로토콜</h2>
          <div className="space-y-5 text-sm text-[#6B6760]">
            <div>
              <p className="font-semibold text-[#18181B]">읽는 순서</p>
              <ol className="mt-2 space-y-1.5 pl-1">
                <li className="flex gap-2"><span className="shrink-0 font-bold text-[#18181B]">1.</span> 회고 전체 읽기 — 루브릭 가설 수립 (확정 아님).</li>
                <li className="flex gap-2"><span className="shrink-0 font-bold text-[#18181B]">2.</span> 프롬프트 로그 읽기 — Collaboration 레벨 판정.</li>
                <li className="flex gap-2"><span className="shrink-0 font-bold text-[#18181B]">3.</span> 최종 diff 읽기 — Verification·Improvement 레벨 판정.</li>
                <li className="flex gap-2"><span className="shrink-0 font-bold text-[#18181B]">4.</span> 축별 레벨 확정 — 각 축을 독립적으로. 한 축의 탁월함이 다른 축의 결핍을 보상하지 않음.</li>
                <li className="flex gap-2"><span className="shrink-0 font-bold text-[#18181B]">5.</span> 각 축 판정에 대해 prompt log 또는 diff에서 ≥1 문장/라인 인용. 인용 없는 점수는 유효하지 않음.</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">가중치</p>
              <p className="mt-1">Collaboration 1/3 · Verification 1/3 · Improvement 1/3 (등가). 축 간 보상 없음.</p>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">총점 해석</p>
              <div className="mt-2 overflow-x-auto rounded-lg border border-[#ECE7DF]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE7DF] bg-[#F8F5F0]">
                      <th className="px-3 py-2 text-left font-semibold text-[#18181B]">총점</th>
                      <th className="px-3 py-2 text-left font-semibold text-[#18181B]">의미</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F0EB]">
                    <tr>
                      <td className="px-3 py-2 font-semibold text-[#18181B]">L12 (4+4+4)</td>
                      <td className="px-3 py-2 text-[#6B6760]">실무 이전 가능한 수준. AI와 함께 일하는 방식을 내면화함. 상위 코호트 피드백 대상.</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-[#18181B]">L9–11</td>
                      <td className="px-3 py-2 text-[#6B6760]">하나 이상의 축에서 강점 명확. 약점 축 1개에 집중 피드백.</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-[#18181B]">L6–8</td>
                      <td className="px-3 py-2 text-[#6B6760]">전반적으로 시도는 있으나 실행이 약하거나 불균등. 가장 낮은 축부터 개선 권고.</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-[#18181B]">L3–5</td>
                      <td className="px-3 py-2 text-[#6B6760]">AI 출력을 수동적으로 수락하거나 반복 없이 제출. 시나리오 재시도 또는 1:1 피드백 권고.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">무엇을 채점하지 않는가</p>
              <ul className="mt-1 space-y-0.5 pl-3">
                <li>• 최종 diff의 미적 완성도 (코딩 스타일, 네이밍, 포매팅)</li>
                <li>• 제출 속도 또는 소요 시간</li>
                <li>• AI 도구 선택 (Claude Code / Cursor / ChatGPT / Gemini 동등 취급)</li>
                <li>• 영어/한국어 사용 비율</li>
                <li>• 프롬프트 로그의 길이 자체 (길다고 좋은 것이 아님)</li>
              </ul>
            </div>
          </div>
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
            <Link
              href="/scenarios/walkthrough"
              className="rounded-lg border border-[#ECE7DF] px-4 py-2 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
            >
              채점된 워크스루 보기
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
