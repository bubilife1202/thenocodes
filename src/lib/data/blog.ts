import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";

export async function getPublishedPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:users(username, display_name, avatar_url)
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:users(username, display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}
