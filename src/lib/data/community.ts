import { createClient } from "@/lib/supabase/server";

export type CommunityPostType = "used_it" | "found_it" | "question";

export interface CommunityPost {
  id: string;
  post_type: CommunityPostType;
  title: string;
  body: string;
  link_url: string | null;
  author_name: string | null;
  vote_count: number;
  created_at: string;
}

export const POST_TYPE_KO: Record<CommunityPostType, string> = {
  used_it: "써봤어요",
  found_it: "발견했어요",
  question: "질문있어요",
};

export const POST_TYPE_VALUES: CommunityPostType[] = ["used_it", "found_it", "question"];

export function isPostType(value: unknown): value is CommunityPostType {
  return typeof value === "string" && POST_TYPE_VALUES.includes(value as CommunityPostType);
}

export async function getCommunityPosts(filter?: CommunityPostType): Promise<CommunityPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter) {
    query = query.eq("post_type", filter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch community posts:", error.message);
    return [];
  }

  return (data ?? []) as CommunityPost[];
}

export async function getMonthlyTopPost(year: number, month: number): Promise<CommunityPost | null> {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 1).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,created_at")
    .gte("created_at", start)
    .lt("created_at", end)
    .order("vote_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data || data.vote_count === 0) return null;
  return data as CommunityPost;
}

export async function getHallOfFame(): Promise<{ year: number; month: number; post: CommunityPost }[]> {
  const now = new Date();
  const results: { year: number; month: number; post: CommunityPost }[] = [];

  for (let i = 1; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const post = await getMonthlyTopPost(d.getFullYear(), d.getMonth() + 1);
    if (post) results.push({ year: d.getFullYear(), month: d.getMonth() + 1, post });
  }

  return results;
}
