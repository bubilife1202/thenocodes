"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { SIGNAL_TYPE_VALUES, type SignalType } from "@/lib/signals/constants";
import { createSignalSlug } from "@/lib/signals/slug";
import { createSignal, initialSignalState } from "./actions";

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  platform_launch: "플랫폼 런칭",
  api_tool: "API / 도구",
  open_model: "오픈 모델",
  policy: "정책",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-[#B45309]">{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "저장 중..." : "흐름 저장"}
    </button>
  );
}

export function SignalEditor({ initialPublishedAt }: { initialPublishedAt: string }) {
  const [state, formAction] = useActionState(createSignal, initialSignalState);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  return (
    <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,118,110,0.2)] sm:p-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">Signals Admin</p>
          <h2 className="text-2xl font-black tracking-tight text-[#18181B]">새 흐름 작성</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6B6760]">
            빌더가 당장 움직일 수 있게, 핵심 요약과 액션 포인트 중심으로 정리합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm text-[#115E59]">
          관리자 인증이 완료되었습니다.
        </div>
      </div>

      <form action={formAction} className="space-y-6">
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

                // 슬러그를 직접 고치기 전에는 제목 변화에 맞춰 자동 생성한다.
                if (!isSlugDirty) {
                  setSlug(createSignalSlug(nextTitle));
                }
              }}
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="예: Anthropic, Claude Code용 원격 MCP 커넥터 공개"
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
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="제목에서 자동 생성됩니다"
            />
            <p className="mt-2 text-xs text-[#8A8278]">한글은 유지되고, 공백은 하이픈으로 바뀝니다.</p>
            <FieldError message={state.fieldErrors?.slug?.[0]} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">요약 *</span>
            <textarea
              name="summary"
              required
              rows={4}
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm leading-relaxed text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="무슨 변화인지, 왜 중요한지 2~3문장으로 요약해 주세요."
            />
            <FieldError message={state.fieldErrors?.summary?.[0]} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">빌더가 당장 해볼 것 *</span>
            <textarea
              name="action_point"
              required
              rows={4}
              className="w-full rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm leading-relaxed text-[#115E59] outline-none transition-colors placeholder:text-[#7AA8A3] focus:border-[#0F766E] focus:bg-white"
              placeholder="예: 지금 바로 문서를 열어보고, 샘플 프로젝트에 붙여보는 단계까지 적어 주세요."
            />
            <FieldError message={state.fieldErrors?.action_point?.[0]} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">출처 URL *</span>
            <input
              type="url"
              name="source_url"
              required
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="https://..."
            />
            <FieldError message={state.fieldErrors?.source_url?.[0]} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">출처 이름</span>
            <input
              type="text"
              name="source_name"
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="예: Anthropic"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">흐름 유형 *</span>
            <select
              name="signal_type"
              required
              defaultValue="platform_launch"
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
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">발행일 *</span>
            <input
              type="date"
              name="published_at"
              required
              defaultValue={initialPublishedAt}
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors focus:border-[#0F766E] focus:bg-white"
            />
            <FieldError message={state.fieldErrors?.published_at?.[0]} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">태그</span>
            <input
              type="text"
              name="tags"
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="AI, Anthropic, Builder Tools"
            />
            <p className="mt-2 text-xs text-[#8A8278]">콤마(,)로 구분해서 입력해 주세요.</p>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 sm:col-span-2">
            <input
              type="checkbox"
              name="is_featured"
              className="h-4 w-4 rounded border-[#B7DDD6] text-[#0F766E] focus:ring-[#0F766E]"
            />
            <span className="text-sm font-medium text-[#18181B]">대표 흐름으로 노출</span>
          </label>
        </div>

        {state.message ? (
          <p className="rounded-2xl border border-[#F3DDC3] bg-[#FFF7EF] px-4 py-3 text-sm text-[#9A5A19]">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[#ECE7DF] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8A8278]">저장하면 Supabase `builder_signals` 테이블에 바로 반영됩니다.</p>
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
