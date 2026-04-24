import Link from "next/link";
import type { Metadata } from "next";
import { InfographicForm } from "./infographic-form";

export const metadata: Metadata = {
  title: "인포그래픽 등록 · 더노코즈",
  description: "더노코즈 인포그래픽 등록 페이지",
};

export default function NewInfographicPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Infographics</p>
          <Link href="/infographics" className="whitespace-nowrap text-xs font-bold text-[#0F766E] hover:underline">
            목록으로 돌아가기 →
          </Link>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">인포그래픽 등록</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
          원문 출처 링크, 제목, 인포그래픽 이미지 URL만 넣으면 됩니다.
        </p>
      </section>

      <InfographicForm />
    </div>
  );
}
