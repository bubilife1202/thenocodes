import { createClient } from "@/lib/supabase/server";

export type OpenclawCategory = "official" | "news" | "community" | "case";

export interface OpenclawPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: OpenclawCategory;
  tags: string[];
  published_at: string;
}

const CATEGORY_TAGS: Record<OpenclawCategory, string> = {
  official: "openclaw-official",
  news: "openclaw-news",
  community: "openclaw-community",
  case: "openclaw-case",
};

export const OPENCLAW_CATEGORY_KO: Record<OpenclawCategory, string> = {
  official: "공식",
  news: "뉴스",
  community: "커뮤니티",
  case: "사례",
};

function getCategoryFromTags(tags: string[]): OpenclawCategory {
  if (tags.includes("openclaw-official")) return "official";
  if (tags.includes("openclaw-news")) return "news";
  if (tags.includes("openclaw-community")) return "community";
  if (tags.includes("openclaw-case")) return "case";
  return "news";
}

export function isOpenclawCategory(value: unknown): value is OpenclawCategory {
  return typeof value === "string" && ["official", "news", "community", "case"].includes(value);
}

export async function getOpenclawPosts(filter?: OpenclawCategory): Promise<OpenclawPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("builder_signals")
    .select("id,slug,title,summary,source_url,source_name,tags,published_at")
    .contains("tags", ["openclaw"])
    .order("published_at", { ascending: false })
    .limit(100);

  if (filter) {
    query = query.contains("tags", [CATEGORY_TAGS[filter]]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch openclaw posts:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    source_url: row.source_url,
    source_name: row.source_name,
    category: getCategoryFromTags(row.tags ?? []),
    tags: row.tags ?? [],
    published_at: row.published_at,
  }));
}
