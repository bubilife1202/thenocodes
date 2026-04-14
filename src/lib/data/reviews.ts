import { createAdminClient } from "@/lib/supabase/admin";

export type ReviewCategory = "tool" | "hackathon" | "course" | "support" | "etc";

export interface ReviewPost {
  id: string;
  title: string;
  body: string;
  category: ReviewCategory;
  author_name: string | null;
  related_url: string | null;
  created_at: string;
}

export const REVIEW_CATEGORY_KO: Record<ReviewCategory, string> = {
  tool: "도구",
  hackathon: "해커톤",
  course: "강의",
  support: "지원사업",
  etc: "기타",
};

export function isReviewCategory(value: unknown): value is ReviewCategory {
  return typeof value === "string" && ["tool", "hackathon", "course", "support", "etc"].includes(value);
}

function getCategoryFromTags(tags: string[]): ReviewCategory {
  for (const tag of tags) {
    if (tag.startsWith("category:")) {
      const cat = tag.slice("category:".length);
      if (isReviewCategory(cat)) return cat;
    }
  }
  return "etc";
}

export async function getReviews(filter?: ReviewCategory): Promise<ReviewPost[]> {
  const supabase = createAdminClient();
  const filterTags = filter ? ["review", `category:${filter}`] : ["review"];
  const { data, error } = await supabase
    .from("feedback_items")
    .select("id,title,body,submitter_name,related_url,tags,created_at,is_public")
    .contains("tags", filterTags)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to fetch reviews:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    category: getCategoryFromTags(row.tags ?? []),
    author_name: row.submitter_name,
    related_url: row.related_url,
    created_at: row.created_at,
  }));
}
