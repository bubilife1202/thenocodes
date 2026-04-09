import type { Metadata } from "next";
import { isSignalsAdminAuthenticated } from "@/lib/signals/admin";
import { PasswordGate } from "./password-gate";
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

export default async function NewSignalPage() {
  const isAuthorized = await isSignalsAdminAuthenticated();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
        <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">새 흐름 등록</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
          플랫폼 출시, API 도구, 오픈 모델, 정책 변화를 더노코즈 톤으로 빠르게 정리하는 관리자 페이지입니다.
        </p>
      </section>

      {isAuthorized ? <SignalEditor initialPublishedAt={getTodayInSeoul()} /> : <PasswordGate />}
    </div>
  );
}
