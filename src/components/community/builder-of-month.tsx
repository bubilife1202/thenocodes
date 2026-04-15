import { getHallOfFame, getMonthlyTopPost } from "@/lib/data/community";

export async function BuilderOfMonth() {
  const now = new Date();
  const currentTop = await getMonthlyTopPost(now.getFullYear(), now.getMonth() + 1);
  const recentHighlights = await getHallOfFame();

  return (
    <div className="rounded-[22px] border border-[#D9EFEA] bg-[linear-gradient(180deg,#F6FCFB_0%,#EEF8F6_100%)] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C7D78]">
        이번 달 많이 추천된 글
      </p>

      {currentTop ? (
        <div className="mt-3">
          <p className="text-sm font-bold text-[#123B38]">
            {currentTop.author_name || "익명"}
            <span className="font-normal text-[#5C7D78]"> 님의 글이 가장 많이 추천받고 있어요.</span>
          </p>
          <p className="mt-1 text-[13px] text-[#5C7D78]">
            &ldquo;{currentTop.title}&rdquo; — {currentTop.vote_count}표
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-[#5C7D78]">
          이번 달 추천이 많이 모인 글이 생기면 여기에서 바로 보여줍니다.
        </p>
      )}

      {recentHighlights.length > 0 && (
        <div className="mt-4 border-t border-[#D9EFEA] pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C7D78]">
            최근 베스트
          </p>
          <div className="space-y-1.5">
            {recentHighlights.map(({ year, month, post }) => (
              <div key={`${year}-${month}`} className="flex items-baseline gap-2 text-[12px]">
                <span className="shrink-0 text-[#A1A1AA]">
                  {year}.{String(month).padStart(2, "0")}
                </span>
                <span className="truncate font-medium text-[#123B38]">
                  {post.author_name || "익명"}
                </span>
                <span className="truncate text-[#5C7D78]">
                  {post.title}
                </span>
                <span className="ml-auto shrink-0 text-[#0F766E]">{post.vote_count}표</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
