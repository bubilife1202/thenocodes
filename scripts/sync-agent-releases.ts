import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { buildOpenclawBoardTags, type OpenclawProject } from "../src/lib/data/openclaw-tags";

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  html_url: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
};

type ReleaseSource = {
  project: OpenclawProject;
  repo: string;
  label: string;
  sourceName: string;
};

type CandidateSignal = {
  slug: string;
  title: string;
  summary: string;
  action_point: string;
  source_url: string;
  source_name: string;
  signal_type: "api_tool";
  tags: string[];
  published_at: string;
  is_featured: false;
};

const RELEASE_SOURCES: ReleaseSource[] = [
  {
    project: "openclaw",
    repo: "openclaw/openclaw",
    label: "OpenClaw",
    sourceName: "OpenClaw GitHub Releases",
  },
  {
    project: "hermes-agent",
    repo: "NousResearch/hermes-agent",
    label: "Hermes Agent",
    sourceName: "Hermes Agent GitHub Releases",
  },
];

function slugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function releaseSlug(project: OpenclawProject, tagName: string) {
  return `${project}-release-${slugPart(tagName)}`;
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function releaseSummary(release: GitHubRelease) {
  const body = stripMarkdown(release.body ?? "");
  if (!body) return "GitHub 릴리즈 노트가 공개되었습니다.";
  return body.slice(0, 320);
}

export function releaseTitle(source: ReleaseSource, release: GitHubRelease) {
  const name = (release.name || release.tag_name).trim();
  const alreadyNamed = name.toLowerCase().includes(source.label.toLowerCase());
  const base = alreadyNamed ? name : `${source.label} ${name}`;
  return /release|릴리스|릴리즈/i.test(base) ? base : `${base} 릴리스`;
}

export function buildReleaseSignal(source: ReleaseSource, release: GitHubRelease): CandidateSignal {
  return {
    slug: releaseSlug(source.project, release.tag_name),
    title: releaseTitle(source, release),
    summary: releaseSummary(release),
    action_point: `${source.label} 릴리즈 노트를 확인하고 로컬 에이전트 워크플로우 변경점을 점검하세요.`,
    source_url: release.html_url,
    source_name: source.sourceName,
    signal_type: "api_tool",
    tags: buildOpenclawBoardTags([
      release.tag_name,
      "agent-updates",
      "release",
      release.prerelease ? "prerelease" : "stable",
    ], { project: source.project, category: "official" }),
    published_at: release.published_at ?? new Date().toISOString(),
    is_featured: false,
  };
}

async function fetchReleases(source: ReleaseSource) {
  const response = await fetch(`https://api.github.com/repos/${source.repo}/releases?per_page=20`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "thenocodes-agent-release-sync",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub releases fetch failed for ${source.repo}: ${response.status} ${await response.text()}`);
  }

  const releases = (await response.json()) as GitHubRelease[];
  return releases.filter((release) => !release.draft);
}

async function getExistingKeys(supabase: ReturnType<typeof createClient>, candidates: CandidateSignal[]) {
  const existingSlugs = new Set<string>();
  const existingUrls = new Set<string>();
  const slugs = candidates.map((candidate) => candidate.slug);
  const urls = candidates.map((candidate) => candidate.source_url);

  if (slugs.length > 0) {
    const { data, error } = await supabase.from("builder_signals").select("slug,source_url").in("slug", slugs);
    if (error) throw new Error(`Failed to check existing slugs: ${error.message}`);
    for (const row of data ?? []) {
      if (row.slug) existingSlugs.add(row.slug);
      if (row.source_url) existingUrls.add(row.source_url);
    }
  }

  if (urls.length > 0) {
    const { data, error } = await supabase.from("builder_signals").select("slug,source_url").in("source_url", urls);
    if (error) throw new Error(`Failed to check existing release URLs: ${error.message}`);
    for (const row of data ?? []) {
      if (row.slug) existingSlugs.add(row.slug);
      if (row.source_url) existingUrls.add(row.source_url);
    }
  }

  return { existingSlugs, existingUrls };
}

export async function syncAgentReleases() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const candidates: CandidateSignal[] = [];
  for (const source of RELEASE_SOURCES) {
    const releases = await fetchReleases(source);
    candidates.push(...releases.map((release) => buildReleaseSignal(source, release)));
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { existingSlugs, existingUrls } = await getExistingKeys(supabase, candidates);
  const rowsToInsert = candidates.filter((candidate) => !existingSlugs.has(candidate.slug) && !existingUrls.has(candidate.source_url));

  if (rowsToInsert.length === 0) {
    return { inserted: [], skipped: candidates.length };
  }

  const { data, error } = await supabase
    .from("builder_signals")
    .insert(rowsToInsert)
    .select("slug,title,source_url");

  if (error) throw new Error(`Failed to insert release rows: ${error.message}`);
  return { inserted: data ?? [], skipped: candidates.length - rowsToInsert.length };
}

async function main() {
  const result = await syncAgentReleases();
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
