import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "채점된 워크스루 — 시나리오 #1 · 더노코즈",
};

const SCORE_ITEMS = [
  { axis: "Collaboration", ko: "협업", level: "L3", note: "목표와 제약을 붙이고, 원인 파악과 숨은 버그 탐색을 분리" },
  { axis: "Verification", ko: "검증", level: "L3", note: "테스트 통과 후 rawHour 경계와 소스를 직접 추적" },
  { axis: "Improvement", ko: "개선", level: "L3", note: "두 버그를 합쳐 수정하고 Bug B 회귀 테스트 추가" },
] as const;

const TRANSCRIPT_CLUSTERS = [
  {
    axis: "Collaboration",
    level: "L3",
    bubbles: [
      ["Learner", "테스트 3개 중 마지막 1개가 실패한다. 나머지 두 테스트는 계속 통과해야 하고, 코드를 바꾸기 전에 실패 원인을 먼저 설명해라."],
      ["Grader", "god-prompt를 피하고 원인 파악과 수정 조건을 분리했다. 다만 시작 전에 전체 3단계 계획을 선언하지는 않았다."],
    ],
  },
  {
    axis: "Verification",
    level: "L3",
    bubbles: [
      ["Learner", "테스트는 3/3 통과했다. 하지만 rawHour가 정확히 24가 되는 케이스를 UTC 0~23 전체 범위에서 다시 추적해달라."],
      ["Grader", "테스트 통과를 그대로 믿지 않고 숨은 Bug B를 찾았다. 같은 모델 재검토에 머문 점 때문에 L4가 아니라 L3다."],
    ],
  },
  {
    axis: "Improvement",
    level: "L3",
    bubbles: [
      ["Learner", "weekday를 advancedDate에서 읽고, dayOverflow를 >= 24로 고치고, Bug B 회귀 테스트를 추가해달라."],
      ["Grader", "최종 diff는 단일 응답 채택이 아니라 두 검증 사이클을 통합한 개선이다. 회귀 테스트가 발견 이후 추가되어 L3다."],
    ],
  },
] as const;

function ScoreRail() {
  return (
    <div className="rounded-[24px] border border-[#D9EFEA] bg-white p-5 shadow-[0_18px_36px_-32px_rgba(15,118,110,0.36)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">Rubric score rail</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-[#18181B]">L9 / L12</p>
      <p className="mt-1 text-sm text-[#6B6760]">운영자 도그푸드 제출물 기준</p>
      <div className="mt-4 space-y-3">
        {SCORE_ITEMS.map((item) => (
          <div key={item.axis} className="rounded-2xl border border-[#F3F0EB] bg-[#FCFBF8] p-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#0F766E] px-2 py-0.5 text-[11px] font-black text-white">{item.level}</span>
              <p className="text-sm font-black text-[#18181B]">{item.axis}</p>
              <span className="ml-auto text-xs text-[#A1A1AA]">{item.ko}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6B6760]">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TranscriptCluster({ cluster }: { cluster: (typeof TRANSCRIPT_CLUSTERS)[number] }) {
  return (
    <div className="rounded-[24px] border border-[#ECE7DF] bg-white p-4">
      <div className="mb-4 flex items-baseline gap-2">
        <p className="text-sm font-black text-[#18181B]">{cluster.axis}</p>
        <span className="rounded-full bg-[#F3FBF9] px-2 py-0.5 text-[11px] font-black text-[#0F766E]">{cluster.level}</span>
      </div>
      <div className="space-y-3">
        {cluster.bubbles.map(([role, text], index) => (
          <div key={role} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[620px] rounded-[20px] border px-4 py-3 ${index % 2 === 0 ? "border-[#ECE7DF] bg-[#FCFBF8]" : "border-[#D9EFEA] bg-[#F3FBF9]"}`}>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6B6760]">{role}</p>
              <p className="mt-1 text-sm leading-6 text-[#18181B]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalkthroughPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 lg:hidden">
        <ScoreRail />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 divide-y divide-[#ECE7DF]">

        {/* Header */}
        <div className="pb-8">
          <p className="mb-2 text-xs font-medium text-[#A1A1AA]">시나리오 #1 — flaky timezone test</p>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B]">채점된 워크스루</h1>
          <p className="mt-1 text-sm text-[#6B6760]">더노코즈 운영자 · 2026-04-22</p>
        </div>

        {/* Validity disclaimer */}
        <div className="py-6">
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-4">
            <p className="text-sm font-bold text-orange-900">타당성 고지 (Validity Disclaimer)</p>
            <p className="mt-2 text-sm text-orange-800">
              이 워크스루는 RUBRIC.md의 <strong>운영성(operability)</strong> — 동일 루브릭을 내부 모순 없이 적용할 수 있음 — 을 입증합니다.{" "}
              <strong>타당성(validity)</strong> — 루브릭 점수가 실제 실력을 측정하는가 — 은 입증하지 않습니다.
              타당성은 외부 채점자와의 inter-rater 데이터로만 확보됩니다.
            </p>
          </div>
        </div>

        {/* Section 1 — 제출 요약 */}
        <div className="py-8">
          <h2 className="mb-4 text-sm font-bold text-[#18181B]">1. 제출 요약</h2>
          <div className="overflow-x-auto rounded-lg border border-[#ECE7DF]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECE7DF] bg-[#F8F5F0]">
                  <th className="px-4 py-2.5 text-left font-semibold text-[#18181B]">축</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#18181B]">레벨</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#18181B]">한 줄 요약</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F0EB]">
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-[#18181B]">Collaboration</td>
                  <td className="px-4 py-2.5 font-bold text-[#0F766E]">L3</td>
                  <td className="px-4 py-2.5 text-[#6B6760]">2개 서브-태스크로 분해, 코드 부착, 수용 기준 명시. 3단계 사전 계획은 없었음.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-[#18181B]">Verification</td>
                  <td className="px-4 py-2.5 font-bold text-[#0F766E]">L3</td>
                  <td className="px-4 py-2.5 text-[#6B6760]">브루트포스 매트릭스로 Bug B 발견. 수정 후 같은 모델에게 재검증 요청 — 독립 신호 아님.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-[#18181B]">Improvement</td>
                  <td className="px-4 py-2.5 font-bold text-[#0F766E]">L3</td>
                  <td className="px-4 py-2.5 text-[#6B6760]">두 버그 모두 수정, 회귀 테스트 추가. 단 Bug B 관찰 이후 반응적으로 추가함.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-base font-bold text-[#18181B]">총점: L9 / L12</span>
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-[#6B6760]"><strong className="text-[#18181B]">핵심 성과:</strong> 실패 테스트(Bug A)와 숨은 버그(Bug B) 모두 수정. Bug B 회귀 테스트 포함.</p>
            <p className="text-[#6B6760]"><strong className="text-[#18181B]">아쉬운 지점:</strong> 수정 후 검증을 같은 모델에게 맡겼다. 회귀 테스트를 Bug B 발견 이전에 예방적으로 추가하지 않았다.</p>
          </div>
        </div>

        {/* Section 1.5 — transcript evidence */}
        <div className="py-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F766E]">Transcript evidence</p>
          <h2 className="mb-2 text-sm font-bold text-[#18181B]">평가 근거를 대화 버블과 채점 해석으로 분리</h2>
          <p className="mb-5 text-sm leading-6 text-[#6B6760]">
            아래 버블은 라이브 채팅이 아니라 제출 로그에서 발췌한 정적 증거입니다. 왼쪽은 학습자/AI 상호작용, 오른쪽은 채점자가 읽은 해석입니다.
          </p>
          <div className="space-y-4">
            {TRANSCRIPT_CLUSTERS.map((cluster) => (
              <TranscriptCluster key={cluster.axis} cluster={cluster} />
            ))}
          </div>
        </div>

        {/* Section 2 — 프롬프트 로그 */}
        <div className="py-8">
          <h2 className="mb-1 text-sm font-bold text-[#18181B]">2. 도그푸드 제출물</h2>
          <p className="mb-5 text-xs text-[#A1A1AA]">도구: Claude Code + claude-opus-4-7 · 날짜: 2026-04-22</p>

          <h3 className="mb-3 text-sm font-semibold text-[#18181B]">2.1 프롬프트 로그</h3>

          {/* 목표 */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold text-[#6B6760] uppercase tracking-wide">목표 (Goal)</p>
            <p className="text-sm text-[#6B6760]">
              <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">formatMeetupDate()</code> 테스트 3개 중 1개가 실패한다는 제보를 받았다. 실패 테스트를 통과시키고, 시나리오 설명대로 &quot;통과하는 테스트 2개가 버그를 가리고 있다&quot;는 힌트를 바탕으로 숨은 버그까지 찾아 고치는 것이 목표다. AI에게 모든 것을 한 번에 던지지 않고, (1) 실패 원인 파악 → (2) 숨은 버그 탐색 두 단계로 나눠서 진행하려 했다.
            </p>
          </div>

          {/* 1차 프롬프트 */}
          <div className="mb-6 rounded-lg border border-[#ECE7DF] bg-white">
            <div className="border-b border-[#ECE7DF] bg-[#F8F5F0] px-4 py-2">
              <p className="text-xs font-bold text-[#18181B]">1차 프롬프트</p>
            </div>
            <div className="p-4">
              <pre className="overflow-x-auto rounded bg-[#F8F5F0] p-3 font-mono text-xs text-[#18181B]">{`아래 유틸 함수와 테스트를 첨부한다.
테스트 3개 중 마지막 1개(late-night / midnight crossing)가 실패한다.

[formatMeetupDate.ts 전체 소스 첨부]
[formatMeetupDate.test.ts 전체 소스 첨부]

vitest 에러 메시지:
  Expected: "2026-04-29 (수) 01:30 KST"
  Received:  "2026-04-29 (화) 01:30 KST"

조건:
- 나머지 두 테스트(midday, evening)는 계속 통과해야 한다.
- 최소한의 수정만 한다.
- 코드를 바꾸기 전에, 실패 원인이 무엇인지 먼저 설명해라.`}</pre>
              <div className="mt-3 space-y-2 text-sm text-[#6B6760]">
                <p><strong className="font-semibold text-[#18181B]">AI 응답 요약:</strong> Claude는 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">rawHour = utcDate.getUTCHours() + 9</code>로 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">advancedDate</code>를 계산하면서 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">weekday</code>는 여전히 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">utcDate.getUTCDay()</code>에서 읽고 있다는 점을 정확히 짚었다. UTC 화요일 16:30은 Seoul에서는 수요일 01:30인데, 요일 레이블이 UTC 기준 화요일(화)로 나온다는 설명이었다.</p>
                <p><strong className="font-semibold text-[#18181B]">검증 시도:</strong> <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">npm test</code>를 돌렸다. 3/3 통과. 좋다 — 싶었는데, 잠깐 멈췄다. 시나리오 설명에서 &quot;통과하는 테스트 2개는 버그를 가리고 있다&quot;고 했다. 테스트가 다 통과한다고 버그가 없는 게 아니다.</p>
                <p>AI가 제안한 수정(<code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">utcDate</code> → <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">advancedDate</code>)은 Bug A를 고쳤다. 그런데 소스를 다시 읽다가 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">dayOverflow</code>를 계산하는 줄이 눈에 걸렸다: <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">const dayOverflow = rawHour &gt; 24 ? 1 : 0;</code> — <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">rawHour</code>가 정확히 24일 때 날짜가 넘어가지 않는다. AI가 이 줄에 대해서는 아무 말도 안 했다.</p>
              </div>
            </div>
          </div>

          {/* 2차 프롬프트 */}
          <div className="mb-6 rounded-lg border border-[#ECE7DF] bg-white">
            <div className="border-b border-[#ECE7DF] bg-[#F8F5F0] px-4 py-2">
              <p className="text-xs font-bold text-[#18181B]">2차 프롬프트</p>
            </div>
            <div className="p-4">
              <pre className="overflow-x-auto rounded bg-[#F8F5F0] p-3 font-mono text-xs text-[#18181B]">{`1차 수정(weekday를 advancedDate에서 읽도록) 반영 후 테스트는 3/3 통과했다.

그런데 "통과하는 테스트 2개가 버그를 가리고 있다"는 힌트가 신경 쓰인다.
아래 질문에 답하기 전에 코드를 수정하지 마라.

질문: UTC 시간 0~23 전체에 대해 rawHour 계산을 직접 추적해줘.
특히 rawHour가 정확히 24가 되는 케이스 — UTC 15:00 → Seoul 00:00 —
에서 dayOverflow가 올바르게 계산되는지 확인해라.

현재 코드의 해당 줄:
  const dayOverflow = rawHour > 24 ? 1 : 0;`}</pre>
              <div className="mt-3 space-y-3 text-sm text-[#6B6760]">
                <p><strong className="font-semibold text-[#18181B]">AI 응답:</strong> Claude는 UTC 15:xx를 직접 추적했다. <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">rawHour = 15 + 9 = 24</code>, <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">24 &gt; 24</code> → false, <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">dayOverflow = 0</code>. 결과: <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">advancedDate</code>가 그대로 원본 날짜. <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">localHour = 24 % 24 = 0</code>. 날짜는 안 넘어갔는데 시간은 00:xx로 표시된다. 이것이 Bug B — Seoul 자정이 전날 날짜와 요일로 출력된다.</p>
                <p><strong className="font-semibold text-[#18181B]">검증 — 브루트포스 매트릭스:</strong> 제안을 바로 적용하기 전에, UTC 0시부터 23시까지 수동으로 확인했다. <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">2026-03-21</code>(토요일)을 기준 날짜로 잡고 각 UTC 시간에 대해 서울 날짜/요일/시간이 어떻게 나오는지 직접 계산했다.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#ECE7DF]">
                        <th className="pr-3 py-1.5 text-left font-semibold text-[#18181B]">UTC hour</th>
                        <th className="pr-3 py-1.5 text-left font-semibold text-[#18181B]">rawHour</th>
                        <th className="pr-3 py-1.5 text-left font-semibold text-[#18181B]">dayOverflow</th>
                        <th className="pr-3 py-1.5 text-left font-semibold text-[#18181B]">Seoul date</th>
                        <th className="pr-3 py-1.5 text-left font-semibold text-[#18181B]">Seoul hour</th>
                        <th className="py-1.5 text-left font-semibold text-[#18181B]">weekday (expected)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F0EB]">
                      <tr>
                        <td className="pr-3 py-1.5 text-[#6B6760]">14</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">23</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">0</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">2026-03-21</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">23</td>
                        <td className="py-1.5 text-[#6B6760]">토 (6)</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="pr-3 py-1.5 font-bold text-red-800">15</td>
                        <td className="pr-3 py-1.5 font-bold text-red-800">24</td>
                        <td className="pr-3 py-1.5 font-bold text-red-800">0 (bug)</td>
                        <td className="pr-3 py-1.5 font-bold text-red-800">2026-03-21 (wrong)</td>
                        <td className="pr-3 py-1.5 font-bold text-red-800">00</td>
                        <td className="py-1.5 font-bold text-red-800">토 (wrong — should be 일)</td>
                      </tr>
                      <tr>
                        <td className="pr-3 py-1.5 text-[#6B6760]">16</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">25</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">1</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">2026-03-22</td>
                        <td className="pr-3 py-1.5 text-[#6B6760]">01</td>
                        <td className="py-1.5 text-[#6B6760]">일 (0)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  <strong className="font-semibold text-[#18181B]">Bug B 확정:</strong>{" "}
                  <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&quot;2026-03-21T15:15:00Z&quot;</code> → 수정 전:{" "}
                  <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&quot;2026-03-21 (토) 00:15 KST&quot;</code>, 수정 후 예상:{" "}
                  <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&quot;2026-03-22 (일) 00:15 KST&quot;</code>.
                </p>
              </div>
            </div>
          </div>

          {/* 3차 프롬프트 */}
          <div className="mb-6 rounded-lg border border-[#ECE7DF] bg-white">
            <div className="border-b border-[#ECE7DF] bg-[#F8F5F0] px-4 py-2">
              <p className="text-xs font-bold text-[#18181B]">3차 프롬프트</p>
            </div>
            <div className="p-4">
              <pre className="overflow-x-auto rounded bg-[#F8F5F0] p-3 font-mono text-xs text-[#18181B]">{`Bug B를 확인했다. >= 24로 수정하면 UTC 15:xx → Seoul 00:xx 케이스가 올바르게
처리된다는 것을 브루트포스로 확인했다.

이제 두 수정을 합쳐달라:
1. weekday를 advancedDate에서 읽기 (Bug A 수정)
2. dayOverflow 조건을 >= 24로 변경 (Bug B 수정)

추가로: Bug B에 대한 회귀 테스트 1개를 test 파일에 추가해달라.
테스트 케이스: "2026-03-21T15:15:00Z" → "2026-03-22 (일) 00:15 KST"
테스트 의도를 주석으로 설명해달라.
기존 테스트 3개는 건드리지 마라.`}</pre>
              <div className="mt-3 space-y-2 text-sm text-[#6B6760]">
                <p><strong className="font-semibold text-[#18181B]">검증:</strong> <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">npm test</code>를 돌려 4/4 통과를 확인했다. 그 다음 Claude에게 &quot;이 수정이 UTC 14:xx, 15:xx, 16:xx 케이스 모두에서 올바른가?&quot; 재확인 요청했다.</p>
                <p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
                  <strong>검증 한계:</strong> 여기서 문제 — 같은 모델에게 자기 작업을 다시 검토시킨 것이다. 이건 독립 신호가 아니다. 다른 모델로 cross-check하거나, 내가 직접 30일치 날짜를 열거해 확인하는 것이 독립 신호였을 것이다.
                </p>
              </div>
            </div>
          </div>

          {/* 최종 PR diff */}
          <h3 className="mb-3 text-sm font-semibold text-[#18181B]">2.2 최종 PR diff</h3>
          <div className="mb-6 rounded-lg border border-[#ECE7DF] bg-[#18181B] p-4">
            <pre className="overflow-x-auto font-mono text-xs text-green-300 whitespace-pre">{`--- a/scenarios/scenario-01-timezone/src/formatMeetupDate.ts
+++ b/scenarios/scenario-01-timezone/src/formatMeetupDate.ts
@@ -23,7 +23,7 @@ export function formatMeetupDate(utc: string, tz: string): string {
-  const dayOverflow = rawHour > 24 ? 1 : 0;
+  const dayOverflow = rawHour >= 24 ? 1 : 0;

   const advancedDate = new Date(utcDate);
   advancedDate.setUTCDate(utcDate.getUTCDate() + dayOverflow);
@@ -36,7 +36,7 @@ export function formatMeetupDate(utc: string, tz: string): string {
-  const weekday = DAYS_KO[utcDate.getUTCDay()];
+  const weekday = DAYS_KO[advancedDate.getUTCDay()];`}</pre>
          </div>
          <div className="mb-6 rounded-lg border border-[#ECE7DF] bg-[#18181B] p-4">
            <pre className="overflow-x-auto font-mono text-xs text-green-300 whitespace-pre">{`--- a/scenarios/scenario-01-timezone/src/formatMeetupDate.test.ts
+++ b/scenarios/scenario-01-timezone/src/formatMeetupDate.test.ts
@@ -26,4 +26,13 @@ describe('formatMeetupDate', () => {
     expect(formatMeetupDate('2026-04-28T16:30:00Z', 'Asia/Seoul')).toBe(
       '2026-04-29 (수) 01:30 KST',
     );
   });
+
+  it('formats Seoul midnight exactly (rawHour === 24, Bug B regression)', () => {
+    // UTC 2026-03-21 15:15 (Saturday) → Seoul 2026-03-22 00:15 (Sunday)
+    // rawHour = 15 + 9 = 24. Bug B: \`> 24\` fails to advance the date.
+    // Fix: \`>= 24\` correctly advances to the next calendar day.
+    expect(formatMeetupDate('2026-03-21T15:15:00Z', 'Asia/Seoul')).toBe(
+      '2026-03-22 (일) 00:15 KST',
+    );
+  });
 });`}</pre>
          </div>

          {/* 회고 */}
          <h3 className="mb-3 text-sm font-semibold text-[#18181B]">2.3 회고 (Reflection)</h3>
          <div className="space-y-4 text-sm text-[#6B6760]">
            <div>
              <p className="font-semibold text-[#18181B]">맨 처음 삽질</p>
              <p className="mt-1">1차 프롬프트 결과로 Bug A를 고쳤고 테스트가 3/3 통과했다. 처음에는 &quot;다 됐다&quot;는 느낌이 들었다. 시나리오 설명의 힌트가 없었다면 여기서 제출했을 것이다. 1차 AI 응답은 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">weekday</code> 줄만 언급했고 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">dayOverflow</code> 줄은 건드리지 않았다. 내가 소스를 직접 읽지 않았다면 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&gt; 24</code>를 눈치채지 못했을 것이다.</p>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">가장 크게 배운 점</p>
              <p className="mt-1">테스트가 다 통과해도 코드를 직접 읽어야 한다. <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&gt; 24</code>처럼 off-by-one은 기존 테스트 입력값이 그 경계를 밟지 않으면 영원히 통과한다. 더 체계적인 방법은 &quot;경계에서 무슨 일이 일어나는가&quot;를 명시적으로 물어보는 것이다 — <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">rawHour</code>가 23, 24, 25일 때 각각 어떻게 되는지.</p>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">AI가 놓친 부분</p>
              <p className="mt-1">1차 프롬프트에서 AI는 실패 테스트의 원인(<code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">weekday</code> 소스)만 봤고, 옆에 있는 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">dayOverflow</code> 조건은 범위 밖이라 언급하지 않았다. 이건 AI 잘못이 아니다 — 내가 &quot;실패 원인만 설명해달라&quot;고 지시했다. 숨은 버그를 찾으려면 내가 별도로 요청해야 했다. 2차 프롬프트에서 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">rawHour === 24</code> 케이스를 명시적으로 추적해달라고 하자 곧바로 정확히 짚었다.</p>
            </div>
            <div>
              <p className="font-semibold text-[#18181B]">다음번에는</p>
              <ol className="mt-1 space-y-1 pl-1">
                <li className="flex gap-2"><span>1.</span> 수정 전에 &quot;이 함수가 다루는 경계 케이스 목록을 열거해달라&quot;를 먼저 요청한다.</li>
                <li className="flex gap-2"><span>2.</span> 경계 케이스 테스트를 먼저 작성해 실패를 확인한 뒤 수정한다.</li>
                <li className="flex gap-2"><span>3.</span> 수정 검증은 같은 모델이 아닌 독립 수단(다른 모델, 직접 열거, adversarial 입력)으로 한다.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Section 3 — 채점 */}
        <div className="py-8">
          <h2 className="mb-5 text-sm font-bold text-[#18181B]">3. 채점 (Graded Section)</h2>

          {/* Collaboration L3 */}
          <div className="mb-6">
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-[#18181B]">3.1 Collaboration</h3>
              <span className="rounded bg-[#0F766E] px-2 py-0.5 text-xs font-bold text-white">L3</span>
            </div>
            <blockquote className="border-l-4 border-[#0F766E] bg-white pl-4 py-3 pr-4 rounded-r-lg mb-3">
              <p className="text-sm text-[#18181B] italic mb-1">
                &quot;조건: 나머지 두 테스트(midday, evening)는 계속 통과해야 한다. 최소한의 수정만 한다. 코드를 바꾸기 전에, 실패 원인이 무엇인지 먼저 설명해라.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 1차 프롬프트</p>
              <p className="text-sm text-[#18181B] italic mt-2 mb-1">
                &quot;아래 질문에 답하기 전에 코드를 수정하지 마라.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 2차 프롬프트</p>
            </blockquote>
            <p className="text-sm text-[#6B6760]">
              이 학습자는 god-prompt를 피했다. 태스크를 &quot;원인 파악&quot;과 &quot;숨은 버그 탐색&quot; 두 단계로 분리했고, 각 프롬프트에 관련 소스 코드를 직접 첨부했으며, 수용 기준을 명시했다. RUBRIC.md Collaboration-L3 앵커에 직접 매핑된다.
            </p>
            <div className="mt-3 space-y-1 text-xs text-[#6B6760]">
              <p><strong className="text-[#18181B]">L2로 내려갔을 조건:</strong> 학습자가 &quot;타임존 테스트가 실패해요. 고쳐주세요.&quot; 한 줄로 시작하고 파일 내용이나 실패 메시지를 붙이지 않았다면 L2였다.</p>
              <p><strong className="text-[#18181B]">L4로 올라갔을 조건:</strong> 첫 번째 프롬프트를 보내기 전에 3단계 계획을 선언하고, 명시적 리다이렉션을 포함했다면 L4였다.</p>
            </div>
          </div>

          {/* Verification L3 */}
          <div className="mb-6">
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-[#18181B]">3.2 Verification</h3>
              <span className="rounded bg-[#0F766E] px-2 py-0.5 text-xs font-bold text-white">L3</span>
            </div>
            <blockquote className="border-l-4 border-[#0F766E] bg-white pl-4 py-3 pr-4 rounded-r-lg mb-3">
              <p className="text-sm text-[#18181B] italic mb-1">
                &quot;2026-03-21(토요일)을 기준 날짜로 잡고 각 UTC 시간에 대해 서울 날짜/요일/시간이 어떻게 나오는지 직접 계산했다.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 2차 프롬프트 검증 (브루트포스 매트릭스)</p>
              <p className="text-sm text-[#18181B] italic mt-2 mb-1">
                &quot;같은 모델에게 자기 작업을 다시 검토시킨 것이다. 이건 독립 신호가 아니다.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 3차 프롬프트 검증 (학습자 스스로 한계 인식)</p>
            </blockquote>
            <p className="text-sm text-[#6B6760]">
              테스트 통과로 만족하지 않고 소스를 직접 읽어 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&gt; 24</code> 조건을 발견했다. UTC 0~23 전체 범위를 수동으로 추적해 Bug B를 발견한 것은 Verification-L3 앵커에 매핑된다.
            </p>
            <div className="mt-3 space-y-1 text-xs text-[#6B6760]">
              <p><strong className="text-[#18181B]">L2로 내려갔을 조건:</strong> 1차 AI 응답 적용 후 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">npm test</code> 3/3 통과를 확인하고 제출했다면 L2였다.</p>
              <p><strong className="text-[#18181B]">L4로 올라갔을 조건:</strong> Bug B 수정 후 다른 모델로 cross-check하거나, UTC 0~23 × 여러 기준 날짜를 직접 열거했다면 L4였다. 독립 신호 — 같은 맹점을 공유하지 않는 검증 수단 — 의 유무가 L3와 L4를 가른다.</p>
            </div>
          </div>

          {/* Improvement L3 */}
          <div className="mb-6">
            <div className="mb-3 flex items-baseline gap-2">
              <h3 className="text-sm font-semibold text-[#18181B]">3.3 Improvement</h3>
              <span className="rounded bg-[#0F766E] px-2 py-0.5 text-xs font-bold text-white">L3</span>
            </div>
            <blockquote className="border-l-4 border-[#0F766E] bg-white pl-4 py-3 pr-4 rounded-r-lg mb-3">
              <p className="text-sm text-[#18181B] italic mb-1">
                &quot;최종 diff는 1차 AI 응답의 재포장이 아니라 두 번의 검증 사이클을 거친 합성이다.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 최종 diff 근거</p>
              <p className="text-sm text-[#18181B] italic mt-2 mb-1">
                &quot;Bug B 회귀 테스트는 3차 프롬프트에서, 즉 Bug B를 발견한 다음에 추가했다.&quot;
              </p>
              <p className="text-xs text-[#A1A1AA]">— 회고</p>
            </blockquote>
            <p className="text-sm text-[#6B6760]">
              단일 AI 응답을 그대로 채택하지 않았다. 1차 응답(Bug A) → 소스 직접 독해 → 2차 프롬프트(Bug B 추적) → 3차 프롬프트(통합 수정 + 회귀 테스트)라는 3라운드 반복을 거쳤다. 최종 diff는 두 버그 모두 수정 + 회귀 테스트 포함으로 Improvement-L3 앵커에 매핑된다.
            </p>
            <div className="mt-3 space-y-1 text-xs text-[#6B6760]">
              <p><strong className="text-[#18181B]">L2로 내려갔을 조건:</strong> 최종 diff가 Bug A만 포함하고 Bug B는 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">{"// TODO"}</code> 주석으로 남겼다면 L2였다.</p>
              <p><strong className="text-[#18181B]">L4로 올라갔을 조건:</strong> Bug B 회귀 테스트를 발견 이전에 — TDD 흐름으로 먼저 실패를 확인한 뒤 수정 — 추가했다면 L4였다.</p>
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
              href="/scenarios/rubric"
              className="rounded-lg border border-[#ECE7DF] px-4 py-2 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
            >
              전체 루브릭 보기
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
      <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
        <ScoreRail />
      </aside>
      </div>
    </div>
  );
}
