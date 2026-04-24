import { createClient } from "@/lib/supabase/server";
import {
  getCategoryFromTags,
  getProjectFromTags,
  OPENCLAW_PROJECT_KO,
  type OpenclawCategory,
  type OpenclawProject,
} from "./openclaw-tags";

export {
  buildOpenclawBoardTags,
  getCategoryFromTags,
  getProjectFromTags,
  isOpenclawCategory,
  isOpenclawProject,
  OPENCLAW_CATEGORY_KO,
  OPENCLAW_PROJECT_KO,
  type OpenclawCategory,
  type OpenclawProject,
} from "./openclaw-tags";

export interface OpenclawPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  project: OpenclawProject;
  category: OpenclawCategory;
  tags: string[];
  published_at: string;
}

type BuilderSignalRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  tags: string[] | null;
  published_at: string | null;
};

export async function getOpenclawPosts(projectFilter?: OpenclawProject, categoryFilter?: OpenclawCategory): Promise<OpenclawPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("builder_signals")
    .select("id,slug,title,summary,source_url,source_name,tags,published_at")
    .or("tags.ov.{openclaw},tags.ov.{hermes-agent},tags.ov.{Hermes},tags.ov.{hermes}")
    .order("published_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Failed to fetch OpenClaw/Hermes posts:", error.message);
    return [];
  }

  const rows = ((data ?? []) as BuilderSignalRow[])
    .map((row) => {
      const tags = row.tags ?? [];
      const project = getProjectFromTags(tags);
      if (!project) return null;
      const category = getCategoryFromTags(tags, project);

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary ?? "",
        source_url: row.source_url ?? "",
        source_name: row.source_name ?? OPENCLAW_PROJECT_KO[project],
        project,
        category,
        tags,
        published_at: row.published_at ?? new Date(0).toISOString(),
      } satisfies OpenclawPost;
    })
    .filter((post): post is OpenclawPost => {
      if (!post) return false;
      if (projectFilter && post.project !== projectFilter) return false;
      if (categoryFilter && post.category !== categoryFilter) return false;
      return true;
    });

  const seenSourceUrls = new Set<string>();
  return rows.filter((post) => {
    if (!post.source_url) return true;
    if (seenSourceUrls.has(post.source_url)) return false;
    seenSourceUrls.add(post.source_url);
    return true;
  });
}
