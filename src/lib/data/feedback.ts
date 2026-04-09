import { createClient } from "@/lib/supabase/server";

export type FeedbackStatus = "inbox" | "queued" | "in_progress" | "review" | "done" | "archived";
export type FeedbackKind = "feature" | "bug" | "ui" | "content" | "data" | "other";
export type FeedbackPriority = "low" | "medium" | "high";

export interface FeedbackItemRow {
  id: string;
  slug: string | null;
  title: string;
  body: string;
  kind: FeedbackKind;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  source: "community" | "operator" | "internal";
  submitter_name: string | null;
  related_url: string | null;
  screenshot_url: string | null;
  tags: string[];
  vote_count: number;
  is_public: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Exclude sensitive fields (submitter_contact, admin_notes) from public queries
const FIELDS = "id,slug,title,body,kind,status,priority,source,submitter_name,related_url,screenshot_url,tags,vote_count,is_public,started_at,completed_at,created_at,updated_at" as const;

export async function getFeedbackBoard() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback_items")
    .select(FIELDS)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to fetch feedback board:", error.message);
    return [] as FeedbackItemRow[];
  }

  return (data ?? []) as FeedbackItemRow[];
}

export async function getFeedbackColumns() {
  const items = await getFeedbackBoard();
  const order: FeedbackStatus[] = ["inbox", "queued", "in_progress", "review", "done"];
  return order.map((status) => ({
    status,
    items: items.filter((item) => item.status === status),
  }));
}
