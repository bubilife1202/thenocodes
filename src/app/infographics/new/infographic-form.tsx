"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createInfographic, type InfographicActionState } from "./actions";

const initialInfographicState: InfographicActionState = {
  message: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
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
      {pending ? "등록 중..." : "인포그래픽 등록"}
    </button>
  );
}

export function InfographicForm() {
  const [state, formAction] = useActionState(createInfographic, initialInfographicState);
  const [sourceUrl, setSourceUrl] = useState("");
  const sourceKind = sourceUrl.toLowerCase().includes("github.com") ? "GitHub" : "논문/원문";

  return (
    <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,118,110,0.2)] sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">Infographics</p>
        <h2 className="text-2xl font-black tracking-tight text-[#18181B]">새 인포그래픽 등록</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6760]">
          원문 링크, 제목, 이미지 URL을 입력하면 목록에 추가됩니다.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

        <div className="grid gap-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">원문 출처 링크 *</span>
            <input
              type="url"
              name="original_url"
              required
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="https://arxiv.org/... 또는 https://github.com/..."
            />
            <p className="mt-2 text-xs text-[#8A8278]">현재 분류: {sourceKind}. GitHub 링크면 자동으로 GitHub로 분류됩니다.</p>
            <FieldError message={state.fieldErrors?.original_url?.[0]} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">제목 *</span>
            <input
              type="text"
              name="title"
              required
              minLength={3}
              maxLength={160}
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="예: OpenAI Agents SDK 한 장 요약"
            />
            <FieldError message={state.fieldErrors?.title?.[0]} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#18181B]">인포그래픽 이미지 URL *</span>
            <input
              type="url"
              name="infographic_url"
              required
              className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
              placeholder="https://.../image.png"
            />
            <p className="mt-2 text-xs text-[#8A8278]">https로 접근 가능한 png, jpg, webp, gif, avif 이미지만 등록됩니다.</p>
            <FieldError message={state.fieldErrors?.infographic_url?.[0]} />
          </label>
        </div>

        {state.message ? (
          <p className="rounded-2xl border border-[#F3DDC3] bg-[#FFF7EF] px-4 py-3 text-sm text-[#9A5A19]">
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[#ECE7DF] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8A8278]">저장하면 바로 공개 목록에 반영됩니다.</p>
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
