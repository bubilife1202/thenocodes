import { createClient } from "@/lib/supabase/server";
import { SIGNAL_TYPE_VALUES, type SignalType } from "@/lib/signals/constants";

export interface SignalRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  action_point: string;
  source_url: string;
  source_name: string | null;
  signal_type: SignalType;
  tags: string[];
  published_at: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const FIELDS =
  "id,slug,title,summary,action_point,source_url,source_name,signal_type,tags,published_at,is_featured,created_at,updated_at" as const;

export function isSignalType(value?: string): value is SignalType {
  return SIGNAL_TYPE_VALUES.includes(value as SignalType);
}

export async function getSignals(filter?: SignalType) {
  const supabase = await createClient();

  let query = supabase
    .from("builder_signals")
    .select(FIELDS)
    .order("published_at", { ascending: false })
    .limit(200);

  if (filter) {
    query = query.eq("signal_type", filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch builder signals:", error.message);
    return [] as SignalRow[];
  }

  return (data ?? []) as SignalRow[];
}

export async function getFeaturedSignals(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("builder_signals")
    .select(FIELDS)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured signals:", error.message);
    return [] as SignalRow[];
  }

  return (data ?? []) as SignalRow[];
}

export async function getSignalBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("builder_signals")
    .select(FIELDS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch builder signal "${slug}":`, error.message);
    return null;
  }

  return data as SignalRow | null;
}
