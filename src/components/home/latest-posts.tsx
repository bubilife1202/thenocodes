import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/blog";

export async function LatestPosts() {
  const posts = await getPublishedPosts(3);

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 게시글이 없습니다. 곧 유용한 콘텐츠가 올라옵니다!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}
          className="block p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
          <h3 className="font-medium text-white mb-1">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {post.author?.display_name} &middot;{" "}
            {post.published_at ? new Date(post.published_at).toLocaleDateString("ko-KR") : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
