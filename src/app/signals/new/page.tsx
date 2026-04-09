import type { Metadata } from "next";
import { SignalEditor } from "./signal-editor";

export const metadata: Metadata = {
  title: "흐름 작성 | 더노코즈",
  description: "더노코즈 관리자용 흐름 작성 페이지",
};

function getTodayInSeoul() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export default async function NewSignalPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const params = await searchParams;
  const adminPassword = process.env.ADMIN_PASSWORD || "thenocodes2026";
  const isAuthorized = params.key === adminPassword;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
        <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">새 흐름 등록</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
          플랫폼 출시, API 도구, 오픈 모델, 정책 변화를 더노코즈 톤으로 빠르게 정리하는 관리자 페이지입니다.
        </p>
      </section>

      {isAuthorized ? (
        <SignalEditor initialPublishedAt={getTodayInSeoul()} adminKey={params.key!} />
      ) : (
        <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,118,110,0.25)] sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">Admin Access</p>
            <h2 className="text-2xl font-black tracking-tight text-[#18181B]">접근 제한</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B6760]">
              관리자 키가 필요합니다. URL에 <code className="rounded bg-[#F5F3EF] px-1.5 py-0.5 text-xs">?key=비밀번호</code>를 붙여서 접속하세요.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
