import type { ChallengeItem, ChallengeKind } from "@/lib/data/challenges";

const KIND_LABELS: Record<ChallengeKind, string> = {
  reasoning: "추론",
  coding: "코딩",
  math: "수학",
  benchmark: "벤치마크",
};

const KIND_STYLES: Record<
  ChallengeKind,
  {
    shell: string;
    chip: string;
    source: string;
    note: string;
    noteText: string;
    button: string;
  }
> = {
  reasoning: {
    shell:
      "border-[#DDD6FE] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] hover:border-[#C4B5FD] hover:shadow-[0_18px_38px_-30px_rgba(124,58,237,0.24)]",
    chip: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
    source: "text-[#6D28D9]",
    note: "bg-[#F5F3FF]",
    noteText: "text-[#5B21B6]",
    button: "border-[#DDD6FE] bg-white text-[#6D28D9] hover:bg-[#FAF7FF]",
  },
  coding: {
    shell:
      "border-[#D9EFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FCFB_100%)] hover:border-[#9ED7CC] hover:shadow-[0_18px_38px_-30px_rgba(15,118,110,0.24)]",
    chip: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]",
    source: "text-[#0F766E]",
    note: "bg-[#F3FBF9]",
    noteText: "text-[#115E59]",
    button: "border-[#D9EFEA] bg-white text-[#0F766E] hover:bg-[#F6FCFB]",
  },
  math: {
    shell:
      "border-[#F3DDC3] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9F2_100%)] hover:border-[#EBC89D] hover:shadow-[0_18px_38px_-30px_rgba(196,106,26,0.24)]",
    chip: "border-[#F3DDC3] bg-[#FFF2E4] text-[#C46A1A]",
    source: "text-[#B45309]",
    note: "bg-[#FFF7EF]",
    noteText: "text-[#9A3412]",
    button: "border-[#F3DDC3] bg-white text-[#C46A1A] hover:bg-[#FFF9F2]",
  },
  benchmark: {
    shell:
      "border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] hover:border-[#CBD5E1] hover:shadow-[0_18px_38px_-30px_rgba(71,85,105,0.24)]",
    chip: "border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]",
    source: "text-[#475569]",
    note: "bg-[#F8FAFC]",
    noteText: "text-[#475569]",
    button: "border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]",
  },
};

export function ChallengeCard({ item }: { item: ChallengeItem }) {
  const styles = KIND_STYLES[item.kind];

  return (
    <article
      className={`group flex h-full flex-col rounded-[28px] border p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)] transition-all hover:-translate-y-0.5 ${styles.shell}`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles.chip}`}>
          {KIND_LABELS[item.kind]}
        </span>
        <span className={`text-[12px] font-semibold ${styles.source}`}>{item.sourceName}</span>
      </div>

      <div className="flex-1">
        <h3 className="text-[19px] font-black leading-snug tracking-tight text-[#18181B]">{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#5F5951]">{item.description}</p>
        <div className={`mt-4 rounded-[22px] px-4 py-3 ${styles.note}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#938B81]">왜 눌러야 하나</p>
          <p className={`mt-2 text-sm leading-relaxed ${styles.noteText}`}>{item.whyTry}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors ${styles.button}`}
        >
          구경하기 →
        </a>
      </div>
    </article>
  );
}
