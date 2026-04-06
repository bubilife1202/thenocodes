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
      <h1 className="text-3xl font-bold text-white mb-2">블로그</h1>
      <p className="text-gray-400 mb-8">AI 활용 팁, 챌린지 풀이 해설, 채용 정보</p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
            <p className="text-sm text-gray-500">
              {post.author?.display_name ?? post.author?.username} &middot;{" "}
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("ko-KR")
                : ""}
            </p>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          아직 게시글이 없습니다. 곧 유용한 콘텐츠가 올라옵니다!
        </div>
      ) : null}
    </div>
  );
}
