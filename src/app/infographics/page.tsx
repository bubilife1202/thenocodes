import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getInfographics, type InfographicRow } from "@/lib/data/infographics";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "인포그래픽 · 더노코즈",
  description: "AI 논문과 주요 GitHub 프로젝트를 한 장의 인포그래픽으로 정리합니다.",
};

const SOURCE_LABEL: Record<InfographicRow["source_type"], string> = {
  paper: "논문",
  github: "GitHub",
};

function sourceTone(sourceType: InfographicRow["source_type"]) {
  return sourceType === "github"
    ? "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]"
    : "border-[#E7D9F8] bg-[#F8F3FF] text-[#6D3FB8]";
}

function InfographicCard({ item }: { item: InfographicRow }) {
  const meta = item.source_type === "github"
    ? item.repository || "GitHub repo"
    : item.authors || "저자 미상";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#ECE7DF] bg-white transition-shadow hover:shadow-[0_18px_36px_-28px_rgba(24,24,27,0.28)]">
      <a href={item.original_url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-[#F8F5F0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.infographic_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
          />
        </div>
        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${sourceTone(item.source_type)}`}>
              {SOURCE_LABEL[item.source_type]}
            </span>
            {item.stars ? <span className="text-[11px] font-bold text-[#A1A1AA]">★ {item.stars.toLocaleString()}</span> : null}
          </div>
          <h3 className="line-clamp-2 text-base font-black leading-snug text-[#18181B]">{item.title}</h3>
          {item.summary && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6B6760]">{item.summary}</p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-[#A1A1AA]">
            <span className="min-w-0 truncate">{meta}</span>
            <span className="shrink-0">
              {item.published_at ? formatShortDate(item.published_at) : formatShortDate(item.created_at)}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

async function InfographicsGrid() {
  const items = await getInfographics();

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D9D4CC] bg-white px-6 py-16 text-center">
        <p className="text-sm font-bold text-[#18181B]">아직 등록된 인포그래픽이 없습니다</p>
        <p className="mt-2 text-sm leading-6 text-[#6B6760]">
          논문, GitHub 프로젝트, 리서치 신호를 한 장 요약 이미지로 만들어 여기에 쌓습니다.
        </p>
        <Link
          href="/infographics/new"
          className="mt-5 inline-flex items-center rounded-full bg-[#18181B] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-[#2D2D30]"
        >
          첫 인포그래픽 등록
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <InfographicCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default async function InfographicsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FFFD_52%,#FFF8EF_100%)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">visual research digest</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">인포그래픽</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6760]">
              AI 논문과 주요 GitHub 프로젝트를 한 장으로 압축합니다. 핵심 한 줄, 구조, 실험/기능, 결과, 한계, 다음 액션이 바로 보이게 정리합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/signals" className="text-xs font-bold text-[#0F766E] hover:underline">
              흐름에서 원천 찾기 →
            </Link>
            <Link
              href="/infographics/new"
              className="whitespace-nowrap inline-flex items-center rounded-full bg-[#0F766E] px-4 py-2 text-xs font-black text-white shadow-[0_12px_28px_-20px_rgba(15,118,110,0.8)] transition-colors hover:bg-[#0B5F58]"
            >
              인포그래픽 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["논문", "복잡한 연구를 실무자가 읽는 한 장 요약으로"],
          ["GitHub", "뜨는 저장소의 문제·설치·활용 포인트를 압축"],
          ["빌더 관점", "왜 지금 봐야 하는지와 따라 해볼 액션까지"],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-[#ECE7DF] bg-white px-4 py-3">
            <p className="text-sm font-black text-[#18181B]">{title}</p>
            <p className="mt-1 text-xs leading-5 text-[#6B6760]">{body}</p>
          </div>
        ))}
      </div>

      {params.status === "created" ? (
        <div className="mb-5 rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm font-bold text-[#115E59]">
          인포그래픽이 등록되었습니다.
        </div>
      ) : null}

      <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="h-80 animate-pulse rounded-[20px] bg-gray-100" />)}</div>}>
        <InfographicsGrid />
      </Suspense>
    </div>
  );
}
