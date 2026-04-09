import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { LoginForm } from "@/app/signals/new/login-form";
import { getPendingSignalById } from "@/lib/data/pending-signals";
import { generateSignalDraft } from "@/lib/signals/draft";
import { PendingReviewForm } from "../pending-review-form";

export const metadata: Metadata = {
  title: "흐름 검토 | 더노코즈",
  description: "슬랙에서 들어온 흐름 링크를 검토하고 승인하는 관리자 페이지",
};

export default async function PendingSignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await cookies()).get("signals-admin")?.value;
  const isAuthorized = token === "authenticated";

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-[#FCFBF8] px-5 py-6 sm:px-8 sm:py-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
          <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">흐름 검토</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
            슬랙에서 들어온 링크를 공개 전에 검토하고 정제하는 관리자 페이지입니다.
          </p>
        </section>
        <LoginForm />
      </div>
    );
  }

  const item = await getPendingSignalById(id);
  if (!item) {
    notFound();
  }

  if (item.status !== "pending") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-8 text-center">
          <p className="text-lg font-bold text-[#18181B]">이미 처리된 항목입니다</p>
          <p className="mt-2 text-sm text-[#6B6760]">이 링크는 더 이상 검토 대기 상태가 아닙니다.</p>
          <Link href="/signals/pending" className="mt-5 inline-flex rounded-2xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white">
            대기열로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const draft = await generateSignalDraft(item.url);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0F766E]">Signals</p>
          <h1 className="text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">흐름 검토</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
            슬랙 링크를 공개 전에 다듬고 승인하는 단계입니다.
          </p>
        </div>
        <Link href="/signals/pending" className="rounded-2xl border border-[#ECE7DF] bg-white px-4 py-3 text-sm font-semibold text-[#18181B]">
          대기열 목록
        </Link>
      </div>

      <PendingReviewForm
        pendingId={item.id}
        url={item.url}
        initialTitle={draft.title}
        initialSummary={draft.summary}
        initialActionPoint={draft.actionPoint}
        initialSourceName={draft.sourceName}
        initialSignalType={draft.signalType}
        initialTags={draft.tags}
      />
    </div>
  );
}
