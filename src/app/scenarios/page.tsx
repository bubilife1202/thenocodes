import type { Metadata } from "next";
import Link from "next/link";
import { submitWaitlist } from "./actions";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI-Assisted Scenario · 더노코즈",
  description:
    "AI와 함께 실전 시나리오를 풀고, 어떻게 협업했는지 평가받습니다. 언러닝 시대의 새로운 실력 훈련.",
};

type Props = {
  searchParams: Promise<{ waitlist?: string }>;
};

const PROOF_BUBBLES = [
  {
    role: "Learner",
    tone: "learner",
    text: "테스트 3개 중 마지막 1개가 실패합니다. 먼저 실패 원인을 설명하고, 나머지 두 테스트는 계속 통과해야 합니다.",
  },
  {
    role: "AI",
    tone: "ai",
    text: "UTC 기준 요일을 그대로 읽고 있어 Seoul 기준으로 날짜가 넘어간 케이스의 요일이 틀립니다. weekday를 advancedDate에서 읽어야 합니다.",
  },
  {
    role: "Verification",
    tone: "verification",
    text: "테스트는 통과했지만 rawHour === 24 경계를 다시 추적했습니다. UTC 15:xx → Seoul 00:xx에서 날짜가 넘어가지 않는 숨은 버그가 남았습니다.",
  },
  {
    role: "Revision",
    tone: "revision",
    text: "weekday 소스 변경과 dayOverflow >= 24 수정, Bug B 회귀 테스트를 함께 반영했습니다. 최종 제출은 두 번의 검증 사이클을 거친 합성입니다.",
  },
] as const;

function ProofBubble({ bubble }: { bubble: (typeof PROOF_BUBBLES)[number] }) {
  const isRight = bubble.tone === "ai";
  const toneClass =
    bubble.tone === "ai"
      ? "border-[#BFE7E0] bg-[#F1FCFA]"
      : bubble.tone === "verification"
        ? "border-[#F4D8A8] bg-[#FFF8EC]"
        : bubble.tone === "revision"
          ? "border-[#CDE8CF] bg-[#F5FCF4]"
          : "border-[#ECE7DF] bg-white";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[680px] rounded-[22px] border px-4 py-3 shadow-sm ${toneClass}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#6B6760]">{bubble.role}</p>
        <p className="mt-1 text-sm leading-6 text-[#18181B]">{bubble.text}</p>
      </div>
    </div>
  );
}

export default async function ScenariosPage({ searchParams }: Props) {
  const params = await searchParams;
  const waitlistStatus = params.waitlist;

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="divide-y divide-[#ECE7DF]">

        {/* Section 1 — Hero */}
        <div className="pb-8">
          <p className="mb-2 text-xs font-medium text-[#A1A1AA]">
            더노코즈 · AI-Assisted Scenario v1
          </p>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B] sm:text-3xl">
            AI와 함께 실전 시나리오를 풀고,{" "}
            <span className="text-[#0F766E]">어떻게 함께 풀었는지</span> 평가받습니다.
          </h1>
          <p className="mt-3 text-base text-[#6B6760] sm:text-lg">
            언러닝 시대의 새로운 실력 — AI를 지휘하고, 검증하고, 개선하는 능력을 훈련합니다.
          </p>
          <div className="mt-5 space-y-3 text-sm text-[#6B6760]">
            <p>
              과제의 단위는 <strong className="font-semibold text-[#18181B]">실전 시나리오 1개</strong>입니다. 시나리오와 함께 루브릭이 제공되고, 제출 후 사람이 직접 채점한 워크스루를 받습니다.
            </p>
            <p>
              왜 19,900원인가, 왜 LLM이 채점하지 않는가 — 아래 FAQ를 참고해주세요.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/scenarios/scenario-01-timezone"
              className="rounded-xl bg-[#0F766E] px-4 py-2.5 text-sm font-black text-white hover:bg-[#0B5F58]"
            >
              시나리오 #1 보기
            </Link>
            <Link
              href="/scenarios/walkthrough"
              className="rounded-xl border border-[#ECE7DF] bg-white px-4 py-2.5 text-sm font-bold text-[#18181B] hover:bg-[#F8F5F0]"
            >
              채점된 워크스루
            </Link>
            <Link
              href="/scenarios/rubric"
              className="rounded-xl border border-[#ECE7DF] bg-white px-4 py-2.5 text-sm font-bold text-[#18181B] hover:bg-[#F8F5F0]"
            >
              루브릭 확인
            </Link>
          </div>
        </div>

        {/* Section 2 — Scenario #1 preview card */}
        <div className="py-8">
          <h2 className="mb-4 text-sm font-bold text-[#18181B]">첫 번째 시나리오</h2>
          <div className="rounded-xl border border-[#ECE7DF] bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold text-[#0F766E]">시나리오 #1</p>
            <h3 className="text-lg font-bold text-[#18181B]">flaky timezone test</h3>
            <p className="mt-2 text-sm text-[#6B6760]">
              더노코즈 밋업 페이지에 붙은{" "}
              <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">formatMeetupDate()</code>{" "}
              유틸이 &quot;날짜가 이상하다&quot;는 제보를 받았습니다. 테스트 3개 중 1개가 실패하고, 통과하는 2개는 버그를 가리고 있습니다. AI와 함께 원인을 찾고, 숨은 버그까지 고쳐야 합니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/scenarios/scenario-01-timezone"
                className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0B5F58]"
              >
                시나리오 자세히 보기
              </Link>
              {/* TN-V2-P5: 이 리포는 현재 더노코즈 메인 레포의 scenarios/scenario-01-timezone/ 서브트리에 있습니다.
                  향후 standalone 리포 이전 후 아래 href를 실제 GitHub URL로 교체하세요. */}
              <a
                href="https://github.com/thenocodes/scenario-01-timezone"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#ECE7DF] px-3 py-1.5 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
              >
                GitHub에서 보기
              </a>
            </div>
          </div>
        </div>

        {/* Section 2.5 — Static proof bubbles */}
        <div className="py-8">
          <div className="rounded-[28px] border border-[#D9EFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5FCFA_100%)] p-4 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0F766E]">Static evidence excerpts</p>
            <h2 className="mt-2 text-lg font-black text-[#18181B]">실제 풀이 대화는 이렇게 남깁니다</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6760]">
              아래 버블은 라이브 채팅 UI가 아니라, 제출자가 남긴 프롬프트 로그와 검증 기록을 요약한 정적 증거 예시입니다.
              더노코즈는 이 증거를 바탕으로 사람이 Collaboration, Verification, Revision 흐름을 채점합니다.
            </p>
            <div className="mt-5 space-y-3">
              {PROOF_BUBBLES.map((bubble) => (
                <ProofBubble key={bubble.role} bubble={bubble} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 3 — Rubric summary */}
        <div className="py-8">
          <h2 className="text-sm font-bold text-[#18181B]">채점은 어떻게 하나요</h2>
          <p className="mt-1 mb-5 text-sm text-[#6B6760]">
            결과물이 아닌 <strong className="font-semibold text-[#18181B]">과정</strong>을 평가합니다. 3개 축, 각 L1~L4.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[#ECE7DF] bg-white p-4">
              <p className="text-xs font-semibold text-[#0F766E]">Axis A</p>
              <p className="mt-0.5 text-sm font-bold text-[#18181B]">Collaboration</p>
              <p className="text-xs text-[#71717A]">협업</p>
              <p className="mt-2 text-xs text-[#6B6760]">
                AI를 어떻게 지휘했는가. 태스크를 단계별로 분해했는지, 목표와 제약을 명시했는지, 맥락을 충분히 첨부했는지를 봅니다.
              </p>
              <p className="mt-3 text-[10px] text-[#A1A1AA]">
                L1~L4, 각 레벨당 구체 앵커 ≥2개 · 사람이 직접 채점
              </p>
            </div>
            <div className="rounded-lg border border-[#ECE7DF] bg-white p-4">
              <p className="text-xs font-semibold text-[#0F766E]">Axis B</p>
              <p className="mt-0.5 text-sm font-bold text-[#18181B]">Verification</p>
              <p className="text-xs text-[#71717A]">검증</p>
              <p className="mt-2 text-xs text-[#6B6760]">
                AI 출력을 수락하기 전에 어떻게 검증했는가. 테스트 실행, diff 직접 검토, 엣지케이스 탐색, 독립 신호 사용 여부를 봅니다.
              </p>
              <p className="mt-3 text-[10px] text-[#A1A1AA]">
                L1~L4, 각 레벨당 구체 앵커 ≥2개 · 사람이 직접 채점
              </p>
            </div>
            <div className="rounded-lg border border-[#ECE7DF] bg-white p-4">
              <p className="text-xs font-semibold text-[#0F766E]">Axis C</p>
              <p className="mt-0.5 text-sm font-bold text-[#18181B]">Improvement</p>
              <p className="text-xs text-[#71717A]">개선</p>
              <p className="mt-2 text-xs text-[#6B6760]">
                AI 출력이 잘못되거나 불완전할 때 어떻게 반복 개선했는가. 검증 결과를 다음 프롬프트에 통합했는지를 봅니다.
              </p>
              <p className="mt-3 text-[10px] text-[#A1A1AA]">
                L1~L4, 각 레벨당 구체 앵커 ≥2개 · 사람이 직접 채점
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/scenarios/rubric"
              className="text-sm text-[#0F766E] hover:underline"
            >
              전체 루브릭 보기 →
            </Link>
          </div>
        </div>

        {/* Section 4 — Graded walkthrough excerpt */}
        <div className="py-8">
          <h2 className="text-sm font-bold text-[#18181B]">채점된 제출물 예시</h2>
          <p className="mt-1 mb-4 text-sm text-[#6B6760]">
            아래는 운영자가 직접 풀고 직접 채점한 워크스루의 Collaboration L3 항목입니다 — 왜 L2도 L4도 아닌지 보여줍니다.
          </p>
          <blockquote className="border-l-4 border-[#0F766E] bg-white pl-4 py-3 pr-4 text-sm text-[#18181B] rounded-r-lg">
            <p className="mb-2">
              이 학습자는 god-prompt를 피했다. (1) 태스크를 &quot;원인 파악&quot;과 &quot;숨은 버그 탐색&quot; 두 단계로 분리했고, (2) 각 프롬프트에 관련 소스 코드를 직접 첨부했으며, (3) 수용 기준(&quot;나머지 테스트 통과&quot;, &quot;최소 수정&quot;, &quot;코드 전에 설명 먼저&quot;)을 명시했다.
            </p>
            <p className="text-[#6B6760]">
              <strong className="font-semibold">L2로 내려갔을 조건:</strong> 학습자가 <code className="rounded bg-[#F8F5F0] px-1 font-mono text-xs">&quot;타임존 테스트가 실패해요. 고쳐주세요.&quot;</code> 한 줄로 시작하고 테스트 파일 내용이나 실패 메시지를 붙이지 않았다면 L2였다. <strong className="font-semibold">L4로 올라갔을 조건:</strong> 첫 번째 프롬프트를 보내기 전에 3단계 계획을 먼저 선언하고, 명시적 리다이렉션을 포함했다면 L4였다.
            </p>
          </blockquote>
          <div className="mt-4">
            <Link
              href="/scenarios/walkthrough"
              className="text-sm text-[#0F766E] hover:underline"
            >
              전체 워크스루 보기 →
            </Link>
          </div>
        </div>

        {/* Section 5 — Pricing */}
        <div className="py-8">
          <div className="rounded-xl border border-[#ECE7DF] bg-white p-6">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-[#18181B]">19,900원</span>
              <span className="text-sm text-[#6B6760]">사전 구매 · 10명 한정 · 0 / 10 spots</span>
              {/* TN-V2-COUNTER: 0은 하드코딩 — Supabase waitlist_leads 카운터 UI는 향후 구현 예정 */}
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-[#6B6760]">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#0F766E]">•</span>
                시나리오 #1 저장소 접근권 + 루브릭
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#0F766E]">•</span>
                1:1 사람 채점 피드백 문서 (축별 레벨 + 증거 인용)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#0F766E]">•</span>
                채점된 운영자 워크스루 전문 (비교 자료)
              </li>
            </ul>
            <div className="mt-5">
              {/* TN-V2-P5: post-Gumroad SKU creation, swap href to gum.co/SCENARIO-01 */}
              <a
                href="#waitlist"
                className="inline-block rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B5F58]"
              >
                사전 구매하기
              </a>
            </div>
            <p className="mt-3 text-xs text-[#A1A1AA]">
              사전 구매 확정 후 Gumroad 결제 링크를 이메일로 보내드립니다.
            </p>
          </div>
        </div>

        {/* Section 6 — FAQ */}
        <div className="py-8">
          <h2 className="mb-5 text-sm font-bold text-[#18181B]">자주 묻는 질문</h2>
          <div className="space-y-3">
            <details className="rounded-lg border border-[#ECE7DF] bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]">
                왜 LLM이 채점하지 않나요?
              </summary>
              <div className="border-t border-[#ECE7DF] px-4 py-3 text-sm text-[#6B6760]">
                LLM으로 LLM 활용을 채점하면 재귀 오류가 생깁니다. AI가 만든 결과물을 AI가 평가하면 같은 맹점을 공유할 수 있습니다. 더노코즈 운영자가 루브릭을 기반으로 직접 채점하며, 각 레벨 판정에는 프롬프트 로그와 diff에서 증거를 인용합니다. 사람 채점은 한계가 아니라 기능입니다 — 재귀 함정을 피하는 설계 선택입니다.
              </div>
            </details>

            <details className="rounded-lg border border-[#ECE7DF] bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]">
                환불은 되나요?
              </summary>
              <div className="border-t border-[#ECE7DF] px-4 py-3 text-sm text-[#6B6760]">
                채점 피드백 전달 후 7일 이내 무조건 환불 가능합니다 (이유 불필요). 채점 결과에 대한 이의는 자동 환불이 아니라, 이의 사유가 기록되어 루브릭 개선 데이터가 됩니다.
              </div>
            </details>

            <details className="rounded-lg border border-[#ECE7DF] bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]">
                내 AI 도구 아무거나 써도 되나요?
              </summary>
              <div className="border-t border-[#ECE7DF] px-4 py-3 text-sm text-[#6B6760]">
                예. Claude Code, Cursor, ChatGPT, Gemini 모두 가능합니다. 어떤 도구를 쓰든 채점에서 동등하게 취급합니다. 단, 프롬프트 로그는 PROMPT_LOG_TEMPLATE.md 구조로 일관되게 기록해야 합니다.
              </div>
            </details>

            <details className="rounded-lg border border-[#ECE7DF] bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]">
                언제 배포되나요?
              </summary>
              <div className="border-t border-[#ECE7DF] px-4 py-3 text-sm text-[#6B6760]">
                사전 구매 10명 확정 후 ~2주 내 첫 코호트 채점을 시작합니다. 베타 코호트 (3~5명, 사전 구매와 별도) 먼저 모집 예정입니다. 알림을 받으시려면 아래 대기 목록에 등록해주세요.
              </div>
            </details>

            <details className="rounded-lg border border-[#ECE7DF] bg-white">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]">
                기존 사전 구매자는 어떻게 되나요?
              </summary>
              <div className="border-t border-[#ECE7DF] px-4 py-3 text-sm text-[#6B6760]">
                이전 브랜딩 시점의 사전 구매는 없었습니다 (사전 구매 게이트가 열린 적 없음). 지금 보시는 AI-Assisted Scenario가 첫 번째 SKU입니다.
              </div>
            </details>
          </div>
        </div>

        {/* Section 7 — Waitlist form */}
        <div id="waitlist" className="py-8">
          <h2 className="text-sm font-bold text-[#18181B]">출시 알림 받기</h2>
          <p className="mt-1 mb-5 text-sm text-[#6B6760]">
            아직 결정 못 하셨나요? 출시 알림만 받아보세요.
          </p>

          {waitlistStatus === "ok" && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              알림 신청을 받았습니다. 출시 시 이메일로 안내드리겠습니다.
            </div>
          )}
          {waitlistStatus === "invalid" && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              이메일 형식을 확인해주세요.
            </div>
          )}
          {waitlistStatus === "error" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              문제가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}

          <form action={submitWaitlist} className="max-w-md space-y-3">
            {/* Honey-pot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <div>
              <label htmlFor="waitlist-email" className="mb-1 block text-xs font-medium text-[#6B6760]">
                이메일
              </label>
              <input
                id="waitlist-email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#ECE7DF] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
            <div className="flex items-start gap-2">
              <input
                id="consent-marketing"
                type="checkbox"
                name="consent_marketing"
                className="mt-0.5 h-4 w-4 rounded border-[#ECE7DF] accent-[#0F766E]"
              />
              <label htmlFor="consent-marketing" className="text-xs text-[#6B6760]">
                사전 구매 알림 / 더노코즈 실험 소식 수신 동의 (선택)
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B5F58]"
            >
              알림 신청
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
