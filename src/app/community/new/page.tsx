import Link from "next/link";
import { submitCommunityPost } from "../actions";

export default function NewCommunityPostPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/community"
        className="mb-4 inline-block text-sm text-[#A1A1AA] hover:text-[#18181B]"
      >
        ← 커뮤니티 전체
      </Link>

      <h1 className="text-xl font-black tracking-tight text-[#18181B]">글쓰기</h1>
      <p className="mt-1 text-sm text-[#6B6760]">
        바로 공개됩니다. 자유롭게 써주세요.
      </p>

      <form action={submitCommunityPost} className="mt-6 space-y-5">
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            분류
          </label>
          <select
            name="post_type"
            required
            className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B]"
          >
            <option value="used_it">써봤어요 — 도구/에이전트 사용 후기</option>
            <option value="found_it">발견했어요 — 링크 공유</option>
            <option value="question">질문있어요 — Q&amp;A</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            제목
          </label>
          <input
            type="text"
            name="title"
            required
            minLength={3}
            maxLength={120}
            placeholder="무엇에 대한 글인가요?"
            className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            내용
          </label>
          <textarea
            name="body"
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            placeholder="자세히 알려주세요"
            className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            링크 <span className="font-normal normal-case tracking-normal">(발견했어요는 필수)</span>
          </label>
          <input
            type="url"
            name="link_url"
            placeholder="https://..."
            className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
            닉네임 <span className="font-normal normal-case tracking-normal">(선택)</span>
          </label>
          <input
            type="text"
            name="author_name"
            maxLength={40}
            placeholder="익명으로 표시됩니다"
            className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D2D30]"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}
