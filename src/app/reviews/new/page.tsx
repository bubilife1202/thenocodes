import Link from "next/link";
import { submitReview } from "@/app/reviews/actions";

export default function NewReviewPage() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/reviews" className="text-sm text-[#6B6760] hover:text-black">← 사용 후기 전체</Link>
      <h1 className="mt-3 text-xl font-black tracking-tight text-[#18181B]">후기 작성</h1>
      <p className="mt-1 text-sm text-[#6B6760]">검수 후 공개됩니다. 실제 경험 위주로 짧게 써주세요.</p>

      <form action={submitReview} className="mt-6 space-y-4 rounded-[22px] bg-[#FAF7F2] p-5">
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">카테고리</label>
          <select name="category" required className="mt-1 w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm">
            <option value="tool">도구 — AI 도구 써본 후기</option>
            <option value="hackathon">해커톤 — 참가 경험</option>
            <option value="course">강의 — 학습 후기</option>
            <option value="support">지원사업 — 스타트업 지원 받은 경험</option>
            <option value="etc">기타</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">제목</label>
          <input name="title" required minLength={3} maxLength={120} placeholder="Cursor 3개월 써본 솔직 후기" className="mt-1 w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">본문</label>
          <textarea name="body" required rows={8} minLength={10} maxLength={2000} placeholder="실제로 어떻게 써봤는지, 뭐가 좋고 뭐가 아쉬웠는지" className="mt-1 w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm leading-relaxed" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">관련 링크 (선택)</label>
          <input name="related_url" type="url" placeholder="https://..." className="mt-1 w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">이름 (선택)</label>
          <input name="author_name" maxLength={40} placeholder="김빌더" className="mt-1 w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm" />
        </div>
        <button type="submit" className="inline-flex items-center rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2A2A2A]">
          후기 제출
        </button>
      </form>
    </div>
  );
}
