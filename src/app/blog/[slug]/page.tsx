import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data/blog";
import dynamic from "next/dynamic";

const MarkdownContent = dynamic(() => import("@/components/blog/markdown-content"), {
  loading: () => <div className="animate-pulse bg-gray-100 rounded h-96" />,
});

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-[#71717A]">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-[#3F3F46] mb-4">{post.title}</h1>
        <p className="text-sm text-[#71717A]">
          {post.author?.display_name ?? post.author?.username} &middot;{" "}
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("ko-KR")
            : ""}
        </p>
      </div>
      <MarkdownContent content={post.content} />
    </article>
  );
}
