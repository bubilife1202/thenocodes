"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { SIGNAL_TYPE_VALUES, type SignalType } from "@/lib/signals/constants";
import { createSignalSlug } from "@/lib/signals/slug";
import { initialReviewState, reviewPendingSignal } from "./actions";

type PendingReviewFormProps = {
  pendingId: string;
  url: string;
  initialTitle: string;
  initialSummary: string;
  initialActionPoint: string;
  initialSourceName: string;
  initialSignalType: SignalType;
  initialTags: string[];
};

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  platform_launch: "플랫폼 런칭",
  api_tool: "API / 도구",
  open_model: "오픈 모델",
  policy: "정책",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-[#B45309]">{message}</p>;
}

function ReviewButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="submit"
        name="intent"
        value="reject"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-2xl border border-[#F3DDC3] bg-[#FFF7EF] px-5 py-3 text-sm font-semibold text-[#9A5A19] transition-colors hover:bg-[#FCEFDc] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "처리 중..." : "반려"}
      </button>
      <button
        type="submit"
        name="intent"
        value="approve"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "처리 중..." : "승인 후 게시"}
      </button>
    </div>
  );
}

export function PendingReviewForm(props: PendingReviewFormProps) {
  const [state, formAction] = useActionState(reviewPendingSignal, initialReviewState);
  const [title, setTitle] = useState(props.initialTitle);
  const [slug, setSlug] = useState(createSignalSlug(props.initialTitle));
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  return (
    <form action={formAction} className="space-y-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,118,110,0.18)] sm:p-8">
      <input type="hidden" name="pending_id" value={props.pendingId} />

      <div className="rounded-2xl border border-[#E9DDFE] bg-[#FAF7FF] p-4 text-sm text-[#5F5951]">
        <p className="font-semibold text-[#7C3AED]">원문 링크</p>
        <a href={props.url} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-[#5B21B6] underline underline-offset-2">
          {props.url}
        </a>
        <p className="mt-3 text-xs text-[#7C3AED]">슬랙에서 들어온 링크를 공개 전에 직접 다듬는 단계입니다.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">제목 *</span>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (!isSlugDirty) {
                setSlug(createSignalSlug(nextTitle));
              }
            }}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.title?.[0]} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">슬러그 *</span>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setIsSlugDirty(true);
              setSlug(event.target.value);
            }}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.slug?.[0]} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">요약 *</span>
          <textarea
            name="summary"
            required
            rows={4}
            defaultValue={props.initialSummary}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm leading-relaxed text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.summary?.[0]} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">빌더가 당장 해볼 것 *</span>
          <textarea
            name="action_point"
            required
            rows={4}
            defaultValue={props.initialActionPoint}
            className="w-full rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm leading-relaxed text-[#115E59] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.action_point?.[0]} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">출처 URL *</span>
          <input
            type="url"
            name="source_url"
            required
            defaultValue={props.url}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
          <FieldError message={state.fieldErrors?.source_url?.[0]} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">출처 이름</span>
          <input
            type="text"
            name="source_name"
            defaultValue={props.initialSourceName}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">흐름 유형 *</span>
          <select
            name="signal_type"
            required
            defaultValue={props.initialSignalType}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          >
            {SIGNAL_TYPE_VALUES.map((type) => (
              <option key={type} value={type}>
                {SIGNAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors?.signal_type?.[0]} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">태그</span>
          <input
            type="text"
            name="tags"
            defaultValue={props.initialTags.join(", ")}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">검토 메모 / 반려 사유</span>
          <textarea
            name="moderation_note"
            rows={3}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm leading-relaxed text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
            placeholder="반려 시 사유를 쓰거나, 나중에 참고할 메모를 남겨도 됩니다."
          />
        </label>
      </div>

      {state.message ? (
        <p className="rounded-2xl border border-[#F3DDC3] bg-[#FFF7EF] px-4 py-3 text-sm text-[#9A5A19]">{state.message}</p>
      ) : null}

      <div className="border-t border-[#ECE7DF] pt-6">
        <ReviewButtons />
      </div>
    </form>
  );
}
