import type { ChallengeItem, ChallengeKind } from "@/lib/data/challenges";

const KIND_LABELS: Record<ChallengeKind, string> = {
  reasoning: "추론",
  coding: "코딩",
  math: "수학",
  benchmark: "벤치마크",
};

const KIND_STYLES: Record<ChallengeKind, string> = {
  reasoning: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
  coding: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]",
  math: "border-[#F3DDC3] bg-[#FFF7EF] text-[#C46A1A]",
  benchmark: "border-[#E5E7EB] bg-[#F8FAFC] text-[#334155]",
};

export function ChallengeCard({ item }: { item: ChallengeItem }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(24,24,27,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#D6D3D1] hover:shadow-[0_16px_36px_-28px_rgba(24,24,27,0.3)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${KIND_STYLES[item.kind]}`}>
          {KIND_LABELS[item.kind]}
        </span>
        <span className="text-[12px] font-medium text-[#8A8278]">{item.sourceName}</span>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-black leading-snug tracking-tight text-[#18181B]">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#5F5951]">{item.description}</p>
        <p className="mt-4 rounded-2xl bg-[#FCFBF8] px-4 py-3 text-sm leading-relaxed text-[#4B5563]">{item.whyTry}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-[#F7F4EE] px-2 py-1 text-[11px] text-[#6B6760]">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center rounded-full border border-[#ECE7DF] bg-[#FCFBF8] px-3 py-2 text-sm font-semibold text-[#18181B] transition-colors hover:border-[#CFC7BB] hover:bg-[#F8F5F0]"
        >
          구경하기 →
        </a>
      </div>
    </article>
  );
}
