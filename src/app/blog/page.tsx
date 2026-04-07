import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/blog";

export const metadata = {
  title: "블로그 - The Nocodes",
  description: "AI 활용 팁, 챌린지 풀이 해설, 채용 정보",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#3F3F46] mb-2">블로그</h1>
      <p className="text-[#71717A] mb-8">AI 활용 팁, 챌린지 풀이 해설, 채용 정보</p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-[#71717A]">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-[#3F3F46] mb-2">{post.title}</h2>
            <p className="text-sm text-[#71717A]">
              {post.author?.display_name ?? post.author?.username} &middot;{" "}
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("ko-KR")
                : ""}
            </p>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-[#71717A]">
          아직 게시글이 없습니다. 곧 유용한 콘텐츠가 올라옵니다!
        </div>
      ) : null}
    </div>
  );
}
