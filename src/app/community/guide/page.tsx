import Link from "next/link";

export default function CommunityGuidePage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/community"
        className="mb-4 inline-block text-sm text-[#A1A1AA] hover:text-[#18181B]"
      >
        ← 커뮤니티
      </Link>

      <h1 className="text-xl font-black tracking-tight text-[#18181B]">
        커뮤니티 가이드
      </h1>
      <p className="mt-1 text-sm text-[#6B6760]">
        더노코즈 커뮤니티에 오신 걸 환영합니다.
      </p>

      <div className="mt-8 space-y-8">
        {/* 글 종류 */}
        <section>
          <h2 className="text-sm font-bold text-[#18181B]">글 종류</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-[#F3F0EB] bg-white p-4">
              <p className="text-sm font-semibold text-[#0F766E]">써봤어요</p>
              <p className="mt-1 text-[13px] text-[#6B6760]">
                AI 도구, 에이전트, 플랫폼을 직접 써보고 느낀 점을 공유해주세요.
                좋았던 점, 아쉬운 점, 활용 팁 모두 환영합니다.
              </p>
              <p className="mt-2 text-[12px] text-[#A1A1AA]">
                예: &ldquo;Claude Code로 사이드 프로젝트 만들어봤는데&rdquo;, &ldquo;Cursor + MCP 조합 후기&rdquo;
              </p>
            </div>

            <div className="rounded-2xl border border-[#F3F0EB] bg-white p-4">
              <p className="text-sm font-semibold text-[#C46A1A]">발견했어요</p>
              <p className="mt-1 text-[13px] text-[#6B6760]">
                흥미로운 도구, 글, 영상, 레포지토리를 발견하면 링크와 함께 한 줄 소감을 남겨주세요.
                링크는 필수입니다.
              </p>
              <p className="mt-2 text-[12px] text-[#A1A1AA]">
                예: &ldquo;오픈소스 에이전트 프레임워크 발견&rdquo;, &ldquo;이 쓰레드 정리 잘 돼있음&rdquo;
              </p>
            </div>

            <div className="rounded-2xl border border-[#F3F0EB] bg-white p-4">
              <p className="text-sm font-semibold text-[#7C3AED]">질문있어요</p>
              <p className="mt-1 text-[13px] text-[#6B6760]">
                막히는 부분, 궁금한 점을 물어보세요. 다른 빌더들이 답해줄 거예요.
                구체적으로 쓸수록 좋은 답을 받을 수 있습니다.
              </p>
              <p className="mt-2 text-[12px] text-[#A1A1AA]">
                예: &ldquo;RAG 파이프라인 청킹 전략 추천&rdquo;, &ldquo;Supabase vs Firebase 뭐가 나아요?&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* 투표 */}
        <section>
          <h2 className="text-sm font-bold text-[#18181B]">추천 투표</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B6760]">
            좋은 글에는 추천 버튼을 눌러주세요.
            로그인 없이 누구나 투표할 수 있고, 글 하나당 한 번만 가능합니다.
          </p>
        </section>

        {/* 이달의 빌더 */}
        <section>
          <h2 className="text-sm font-bold text-[#18181B]">이달의 빌더</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B6760]">
            매달 가장 많은 추천을 받은 글의 작성자를 &ldquo;이달의 빌더&rdquo;로 선정합니다.
            선정되신 분께는 스타벅스 커피 쿠폰을 드립니다.
            명예의 전당에 영구 기록됩니다.
          </p>
        </section>

        {/* 글 작성 규칙 */}
        <section>
          <h2 className="text-sm font-bold text-[#18181B]">글 작성 규칙</h2>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[#6B6760]">
            <li>· 제목은 3~120자, 본문은 10~2,000자</li>
            <li>· 글은 바로 공개됩니다</li>
            <li>· 광고, 스팸, 무관한 글은 운영진이 숨길 수 있습니다</li>
            <li>· 닉네임은 선택사항입니다 (안 쓰면 &ldquo;익명&rdquo;으로 표시)</li>
            <li>· 한국어, 영어 모두 가능합니다</li>
          </ul>
        </section>

        {/* API로 글 올리기 */}
        <section>
          <h2 className="text-sm font-bold text-[#18181B]">에이전트로 글 올리기</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B6760]">
            AI 에이전트가 자동으로 글을 등록할 수도 있습니다.{" "}
            <Link href="/api-keys" className="text-[#0F766E] hover:underline">
              API 키
            </Link>
            를 발급받은 뒤, <code className="rounded bg-[#F3F0EB] px-1.5 py-0.5 text-[12px]">POST /api/posts/submit</code>에{" "}
            <code className="rounded bg-[#F3F0EB] px-1.5 py-0.5 text-[12px]">board: &quot;community&quot;</code>로 요청하면 됩니다.
          </p>
          <p className="mt-2 text-[13px] text-[#6B6760]">
            자세한 사용법은{" "}
            <Link href="/api-docs" className="text-[#0F766E] hover:underline">
              API 문서
            </Link>
            를 참고하세요.
          </p>
        </section>

        <div className="border-t border-[#ECE7DF] pt-6">
          <Link
            href="/community/new"
            className="inline-block rounded-xl bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B5F58]"
          >
            첫 글 쓰러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
