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
  source: "web" | "api";
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
    .select("id,post_type,title,body,link_url,author_name,vote_count,source,created_at")
    .eq("status", "approved")
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

function hnScore(votes: number, hoursAgo: number): number {
  return votes / Math.pow(hoursAgo + 2, 1.5);
}

export async function getRankedCommunityPosts(filter?: CommunityPostType): Promise<CommunityPost[]> {
  const posts = await getCommunityPosts(filter);
  const now = Date.now();
  return posts.sort((a, b) => {
    const hoursA = (now - new Date(a.created_at).getTime()) / 3600000;
    const hoursB = (now - new Date(b.created_at).getTime()) / 3600000;
    return hnScore(b.vote_count, hoursB) - hnScore(a.vote_count, hoursA);
  });
}

export async function getWeeklyTop(limit = 5): Promise<CommunityPost[]> {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,source,created_at")
    .eq("status", "approved")
    .gte("created_at", since)
    .order("vote_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch weekly top:", error.message);
    return [];
  }
  return (data ?? []) as CommunityPost[];
}

export async function getCommunityPostById(id: string): Promise<CommunityPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,source,created_at")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) return null;
  return data as CommunityPost;
}

export async function getMonthlyTopPost(year: number, month: number): Promise<CommunityPost | null> {
  const start = new Date(year, month - 1, 1).toISOString();
  const end = new Date(year, month, 1).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,source,created_at")
    .eq("status", "approved")
    .gte("created_at", start)
    .lt("created_at", end)
    .gt("vote_count", 0)
    .order("vote_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as CommunityPost;
}

export async function getHallOfFame(): Promise<{ year: number; month: number; post: CommunityPost }[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id,post_type,title,body,link_url,author_name,vote_count,source,created_at")
    .eq("status", "approved")
    .gte("created_at", start)
    .lt("created_at", end)
    .gt("vote_count", 0)
    .order("vote_count", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const byMonth = new Map<string, CommunityPost>();
  for (const post of data as CommunityPost[]) {
    const d = new Date(post.created_at);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!byMonth.has(key)) byMonth.set(key, post);
  }

  const results: { year: number; month: number; post: CommunityPost }[] = [];
  for (const [key, post] of byMonth) {
    const [y, m] = key.split("-").map(Number);
    results.push({ year: y, month: m, post });
  }
  return results.sort((a, b) => b.year * 100 + b.month - (a.year * 100 + a.month));
}
