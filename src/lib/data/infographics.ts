import { createClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

export type InfographicSourceType = "paper" | "github";

export interface InfographicRow {
  id: string;
  slug: string;
  source_type: InfographicSourceType;
  title: string;
  original_url: string;
  infographic_url: string;
  summary: string | null;
  authors: string | null;
  repository: string | null;
  stars: number | null;
  tags: string[];
  published_at: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const FIELDS =
  "id,slug,source_type,title,original_url,infographic_url,summary,authors,repository,stars,tags,published_at,is_featured,created_at,updated_at" as const;

function isMissingInfographicsTable(error: PostgrestError) {
  return error.code === "PGRST205" || error.message.includes("public.infographics");
}

function handleInfographicsError(error: PostgrestError, label: string) {
  // The route can be deployed before the Supabase migration is applied. In that
  // window, keep the public page on the empty state instead of filling logs with
  // PostgREST schema-cache noise.
  if (isMissingInfographicsTable(error)) return [] as InfographicRow[];

  console.error(`Failed to fetch ${label}:`, error.message);
  return [] as InfographicRow[];
}

export async function getInfographics(limit = 200) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("infographics")
    .select(FIELDS)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return handleInfographicsError(error, "infographics");
  }

  return (data ?? []) as InfographicRow[];
}

export async function getFeaturedInfographics(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("infographics")
    .select(FIELDS)
    .eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return handleInfographicsError(error, "featured infographics");
  }

  return (data ?? []) as InfographicRow[];
}

export async function getInfographicBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("infographics")
    .select(FIELDS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (isMissingInfographicsTable(error)) return null;

    console.error(`Failed to fetch infographic "${slug}":`, error.message);
    return null;
  }

  return data as InfographicRow | null;
}
