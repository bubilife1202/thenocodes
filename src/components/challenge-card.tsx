import Link from "next/link";
import type {
  ChallengeItem,
  ChallengeKind,
  ChallengeKoreanSupport,
  ChallengePricingTier,
} from "@/lib/data/challenges";

const KIND_LABELS: Record<ChallengeKind, string> = {
  prototype: "프로토타입",
  docs: "문서",
  visual: "비주얼",
  audio: "오디오",
};

const KIND_STYLES: Record<
  ChallengeKind,
  {
    shell: string;
    chip: string;
    source: string;
    bubble: string;
    button: string;
  }
> = {
  prototype: {
    shell:
      "border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] hover:border-[#CBD5E1] hover:shadow-[0_18px_38px_-30px_rgba(71,85,105,0.24)]",
    chip: "border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]",
    source: "text-[#475569]",
    bubble: "bg-[#F8FAFC] text-[#475569]",
    button: "border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]",
  },
  docs: {
    shell:
      "border-[#D9EFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FCFB_100%)] hover:border-[#9ED7CC] hover:shadow-[0_18px_38px_-30px_rgba(15,118,110,0.24)]",
    chip: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]",
    source: "text-[#0F766E]",
    bubble: "bg-[#F3FBF9] text-[#115E59]",
    button: "border-[#D9EFEA] bg-white text-[#0F766E] hover:bg-[#F6FCFB]",
  },
  visual: {
    shell:
      "border-[#DDD6FE] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] hover:border-[#C4B5FD] hover:shadow-[0_18px_38px_-30px_rgba(124,58,237,0.24)]",
    chip: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
    source: "text-[#6D28D9]",
    bubble: "bg-[#F5F3FF] text-[#5B21B6]",
    button: "border-[#DDD6FE] bg-white text-[#6D28D9] hover:bg-[#FAF7FF]",
  },
  audio: {
    shell:
      "border-[#F3DDC3] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF8F1_100%)] hover:border-[#E7C08B] hover:shadow-[0_18px_38px_-30px_rgba(196,106,26,0.24)]",
    chip: "border-[#F3DDC3] bg-[#FFF2E4] text-[#C46A1A]",
    source: "text-[#B45309]",
    bubble: "bg-[#FFF4EA] text-[#9A3412]",
    button: "border-[#F3DDC3] bg-white text-[#C46A1A] hover:bg-[#FFF9F2]",
  },
};

const FRICTION_STYLES: Record<ChallengeItem["friction"], string> = {
  "즉시 사용": "bg-[#F3FBF9] text-[#0F766E]",
  "계정 필요": "bg-[#FFF2E4] text-[#B45309]",
  "조금 탐색": "bg-[#F5F3FF] text-[#6D28D9]",
};

const KOREAN_SUPPORT_LABELS: Record<ChallengeKoreanSupport, string> = {
  full: "한국어 좋음",
  partial: "한국어 보통",
  "english-only": "영문 중심",
};

const KOREAN_SUPPORT_STYLES: Record<ChallengeKoreanSupport, string> = {
  full: "bg-[#EEF5FF] text-[#315E9B]",
  partial: "bg-[#F5F3FF] text-[#6D28D9]",
  "english-only": "bg-[#F5F3EF] text-[#78716C]",
};

const PRICING_LABELS: Record<ChallengePricingTier, string> = {
  free: "무료",
  freemium: "부분 무료",
  paid: "유료 중심",
};

const PRICING_STYLES: Record<ChallengePricingTier, string> = {
  free: "bg-[#F3FBF9] text-[#0F766E]",
  freemium: "bg-[#FFF7EF] text-[#C46A1A]",
  paid: "bg-[#F5F3EF] text-[#78716C]",
};

export function ChallengeCard({
  item,
  referenceCount = 0,
  commentCount = 0,
  experimentLogCount = 0,
}: {
  item: ChallengeItem;
  referenceCount?: number;
  commentCount?: number;
  experimentLogCount?: number;
}) {
  const styles = KIND_STYLES[item.kind];

  const primaryRecipe = item.recipes[0];

  return (
    <article
      className={`group flex h-full flex-col rounded-[28px] border p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)] transition-all hover:-translate-y-0.5 ${styles.shell}`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${KOREAN_SUPPORT_STYLES[item.koreanSupport]}`}>
          {KOREAN_SUPPORT_LABELS[item.koreanSupport]}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${PRICING_STYLES[item.pricingTier]}`}>
          {PRICING_LABELS[item.pricingTier]}
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles.chip}`}>
          {KIND_LABELS[item.kind]}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${FRICTION_STYLES[item.friction]}`}>
          {item.friction}
        </span>
        <span className={`text-[12px] font-semibold ${styles.source}`}>{item.sourceName}</span>
        {referenceCount > 0 && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">레퍼런스 {referenceCount}</span>}
        {commentCount > 0 && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">코멘트 {commentCount}</span>}
        {experimentLogCount > 0 && (
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">
            실험 {experimentLogCount}회
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-[19px] font-black leading-snug tracking-tight text-[#18181B]">{item.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#5F5951]">{item.description}</p>
        <div className={`mt-4 rounded-[20px] px-4 py-3 ${styles.bubble}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#938B81]">샘플 활용</p>
          <p className="mt-2 text-sm leading-relaxed">{item.useCase}</p>
        </div>
        <div className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[#4B5563]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">오늘 바로 써볼 레시피</p>
          <p className="mt-2 font-semibold text-[#18181B]">{primaryRecipe.scenario}</p>
          <p className="mt-1 leading-relaxed text-[#6B6760]">{primaryRecipe.resultHint}, {primaryRecipe.expectedTime}</p>
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

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/challenges/${item.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
          >
            보드 보기 →
          </Link>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors ${styles.button}`}
          >
            {item.ctaLabel ?? "열기 →"}
          </a>
        </div>
      </div>
    </article>
  );
}
