import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { LoginForm } from "@/app/signals/new/login-form";
import { getPendingSignals } from "@/lib/data/pending-signals";

export const metadata: Metadata = {
  title: "흐름 검토 대기열 | 더노코즈",
  description: "슬랙에서 들어온 흐름 링크를 검토하고 승인하는 관리자 페이지",
};

export default async function PendingSignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const token = (await cookies()).get("signals-admin")?.value;
  const isAuthorized = token === "authenticated";

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
          <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">흐름 검토 대기열</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
            슬랙에서 들어온 링크를 공개 전에 검토하고 정제하는 관리자 페이지입니다.
          </p>
        </section>
        <LoginForm />
      </div>
    );
  }

  const pending = await getPendingSignals();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
        <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">흐름 검토 대기열</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
          슬랙에서 받은 링크를 원문 확인 → 정제 → 승인 순서로 처리합니다.
        </p>
      </section>

      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm text-[#115E59]">
          {params.status === "approved" ? "흐름을 승인하고 공개했습니다." : "대기열 항목을 반려했습니다."}
        </div>
      ) : null}

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-[#ECE7DF] bg-white px-6 py-16 text-center text-[#A1A1AA]">
          <p className="mb-1 font-bold text-[#18181B]">검토 대기중인 링크가 없습니다</p>
          <p className="text-sm">슬랙 #흐름-링크에 들어온 링크가 있으면 여기 쌓입니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <Link
              key={item.id}
              href={`/signals/pending/${item.id}`}
              className="block rounded-2xl border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(24,24,27,0.18)] transition-colors hover:border-[#D9EFEA]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#8A8278]">
                <span className="rounded-full border border-[#D9EFEA] bg-[#F3FBF9] px-2.5 py-1 font-semibold text-[#0F766E]">pending</span>
                <span>{new Date(item.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
              </div>
              <p className="text-sm font-semibold text-[#18181B]">{item.url}</p>
              <p className="mt-2 text-xs text-[#8A8278]">제출자: {item.submitted_by || "알 수 없음"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
