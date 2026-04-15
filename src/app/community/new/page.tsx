import Link from "next/link";
import { CommunityPostForm } from "./community-post-form";

export const metadata = {
  title: "글쓰기 — 더노코즈 커뮤니티",
};

export default async function NewCommunityPostPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
      {params.status === "missing-link" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          발견했어요 글은 공유할 링크가 꼭 필요합니다.
        </div>
      )}
      {params.status === "validation" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          입력을 확인해주세요. 제목 3자 이상, 본문 10자 이상이 필요합니다.
        </div>
      )}
      {params.status === "error" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          글을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

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

      <CommunityPostForm />
    </div>
  );
}
