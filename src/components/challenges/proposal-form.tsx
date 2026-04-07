"use client";

import { createProposal } from "@/lib/actions/proposals";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";
import { useActionState } from "react";

export function ProposalForm() {
  const [state, formAction, isPending] = useActionState(createProposal, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1">
          제목
        </label>
        <input
          name="title"
          required
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#3F3F46] placeholder-gray-400 focus:outline-none focus:border-[#14B8A6]"
          placeholder="챌린지 문제 제목"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1">
          문제 설명
        </label>
        <textarea
          name="description"
          required
          rows={6}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#3F3F46] placeholder-gray-400 focus:outline-none focus:border-[#14B8A6]"
          placeholder="문제를 상세히 설명해주세요. 배경, 요구사항, 예상 결과물 등"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#3F3F46] mb-1">
            카테고리
          </label>
          <select
            name="category"
            required
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#3F3F46] focus:outline-none focus:border-[#14B8A6]"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3F3F46] mb-1">
            난이도 제안
          </label>
          <select
            name="difficulty"
            required
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#3F3F46] focus:outline-none focus:border-[#14B8A6]"
          >
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3F3F46] mb-1">
          실무 활용 사례 (선택)
        </label>
        <textarea
          name="real_world_context"
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[#3F3F46] placeholder-gray-400 focus:outline-none focus:border-[#14B8A6]"
          placeholder="이 문제가 실무에서 어떻게 활용될 수 있는지 설명해주세요"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
      >
        {isPending ? "제출 중..." : "문제 제안하기"}
      </button>
    </form>
  );
}
