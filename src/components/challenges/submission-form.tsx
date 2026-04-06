"use client";

import { createSubmission } from "@/lib/actions/submissions";
import { useRef } from "react";

export function SubmissionForm({
  challengeId,
  isLoggedIn,
}: {
  challengeId: string;
  isLoggedIn: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isLoggedIn) {
    return (
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
        <p className="text-gray-400">풀이를 제출하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    await createSubmission(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-white">풀이 제출</h3>
      <input type="hidden" name="challenge_id" value={challengeId} />
      <div>
        <label className="block text-sm text-gray-400 mb-1">풀이 설명</label>
        <textarea
          name="content"
          required
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="풀이 과정과 결과를 설명해주세요..."
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">링크 (선택)</label>
        <input
          name="link_url"
          type="url"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="GitHub, 배포 URL 등"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
      >
        제출하기
      </button>
    </form>
  );
}
