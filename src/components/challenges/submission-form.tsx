"use client";

import { createSubmission } from "@/lib/actions/submissions";
import { useRef, useState } from "react";

export function SubmissionForm({
  challengeId,
  isLoggedIn,
}: {
  challengeId: string;
  isLoggedIn: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="p-10 bg-white border border-gray-100 rounded-[2rem] text-center shadow-sm">
        <p className="text-sm font-bold text-[#71717A] mb-4">
          풀이를 제출하려면 로그인이 필요해요 ☕️
        </p>
        <p className="text-xs text-[#A1A1AA]">더노코즈 카페의 멤버가 되어 멋진 아이디어를 나눠주세요!</p>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createSubmission(formData);
      formRef.current?.reset();
      alert("풀이가 성공적으로 공유되었습니다! 🎉");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="cafe-card p-8 md:p-10 bg-white shadow-md space-y-6"
    >
      <input type="hidden" name="challenge_id" value={challengeId} />
      
      <div>
        <label className="block text-xs font-black text-[#A1A1AA] uppercase tracking-widest mb-2 px-1">
          💡 풀이 포인트
        </label>
        <textarea
          name="content"
          required
          rows={6}
          className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-5 py-4 text-[#3F3F46] text-sm placeholder-[#A1A1AA] focus:outline-none focus:border-[#34D399] transition-all resize-none shadow-inner"
          placeholder="어떤 AI 도구를 사용했나요? 핵심 해결 아이디어를 동료들에게 설명해주세요..."
        />
      </div>
      
      <div>
        <label className="block text-xs font-black text-[#A1A1AA] uppercase tracking-widest mb-2 px-1">
          🔗 참고 링크 (선택)
        </label>
        <input
          name="link_url"
          type="url"
          className="w-full bg-[#FDFBF7] border border-gray-100 rounded-2xl px-5 py-3 text-[#3F3F46] text-sm placeholder-[#A1A1AA] focus:outline-none focus:border-[#34D399] transition-all shadow-inner"
          placeholder="GitHub, 배포 URL, 공유된 프롬프트 등"
        />
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-10 py-4 bg-[#3F3F46] hover:bg-[#27272A] disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isSubmitting ? "공유하는 중..." : "나의 풀이 공유하기 ✨"}
        </button>
        <p className="mt-4 text-[10px] text-[#A1A1AA] font-bold text-center md:text-left px-1 leading-relaxed">
          공유해주신 풀이는 동료들에게 큰 영감이 됩니다. <br />
          제출 시 <span className="text-[#F59E0B]">10포인트</span>가 적립됩니다!
        </p>
      </div>
    </form>
  );
}
