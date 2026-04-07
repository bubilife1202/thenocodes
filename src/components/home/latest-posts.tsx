import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/blog";

export async function LatestPosts() {
  const posts = await getPublishedPosts(6);

  if (posts.length === 0) {
    return (
      <div className="py-12 px-6 border border-dashed border-black/[0.05] rounded-xl text-center">
        <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">No insights found.</p>
      </div>
    );
  }

  function getDomain(url: string) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'Link';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="group flex flex-col p-6 bg-white border border-black/[0.04] rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-[#14B8A6]/20 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {post.link_url ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#1D4ED8] uppercase tracking-wider">
                  {getDomain(post.link_url)} 🔗
                </span>
              ) : (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#0F766E] uppercase tracking-wider">
                  Original ✍️
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-[#A1A1AA]">
              {post.published_at ? new Date(post.published_at).toLocaleDateString("ko-KR") : ""}
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="flex-1">
            <h3 className="text-base font-black text-[#18181B] group-hover:text-[#14B8A6] transition-colors mb-2 leading-tight">
              {post.title}
            </h3>
            <p className="text-[13px] text-[#71717A] line-clamp-2 leading-relaxed mb-4 font-medium">
              {post.content.replace(/[#*]/g, '').slice(0, 120)}...
            </p>
          </Link>

          <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 border border-black/[0.05] flex items-center justify-center text-[8px]">
                {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover rounded-full" /> : "👤"}
              </div>
              <span className="text-[11px] font-bold text-[#52525B]">
                {post.author?.display_name ?? post.author?.username}
              </span>
            </div>
            {post.link_url && (
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black text-[#1D4ED8] hover:underline"
              >
                원문 보기 →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
