import { getMonthlyTopPost, getHallOfFame, POST_TYPE_KO } from "@/lib/data/community";

export async function BuilderOfMonth() {
  const now = new Date();
  const currentTop = await getMonthlyTopPost(now.getFullYear(), now.getMonth() + 1);
  const hallOfFame = await getHallOfFame();

  return (
    <div className="rounded-[22px] border border-[#D9EFEA] bg-[linear-gradient(180deg,#F6FCFB_0%,#EEF8F6_100%)] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C7D78]">
        이달의 빌더
      </p>

      {currentTop ? (
        <div className="mt-3">
          <p className="text-sm font-bold text-[#123B38]">
            {currentTop.author_name || "익명"}{" "}
            <span className="font-normal text-[#5C7D78]">님</span>
          </p>
          <p className="mt-1 text-[13px] text-[#5C7D78]">
            &ldquo;{currentTop.title}&rdquo; — {currentTop.vote_count}표
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-[#5C7D78]">
          이번 달 가장 많은 추천을 받은 글의 작성자에게 스타벅스 커피를 드려요!
        </p>
      )}

      {hallOfFame.length > 0 && (
        <div className="mt-4 border-t border-[#D9EFEA] pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5C7D78]">
            명예의 전당
          </p>
          <div className="space-y-1.5">
            {hallOfFame.map(({ year, month, post }) => (
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
