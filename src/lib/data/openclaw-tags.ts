export type OpenclawProject = "openclaw" | "hermes-agent";
export type OpenclawCategory = "official" | "news" | "community" | "case";

export const OPENCLAW_PROJECTS: OpenclawProject[] = ["openclaw", "hermes-agent"];
export const OPENCLAW_CATEGORIES: OpenclawCategory[] = ["official", "news", "community", "case"];

export const OPENCLAW_PROJECT_KO: Record<OpenclawProject, string> = {
  openclaw: "OpenClaw",
  "hermes-agent": "Hermes Agent",
};

export const OPENCLAW_CATEGORY_KO: Record<OpenclawCategory, string> = {
  official: "공식",
  news: "뉴스",
  community: "커뮤니티",
  case: "사례",
};

export const CATEGORY_TAGS: Record<OpenclawProject, Record<OpenclawCategory, string>> = {
  openclaw: {
    official: "openclaw-official",
    news: "openclaw-news",
    community: "openclaw-community",
    case: "openclaw-case",
  },
  "hermes-agent": {
    official: "hermes-agent-official",
    news: "hermes-agent-news",
    community: "hermes-agent-community",
    case: "hermes-agent-case",
  },
};

const LEGACY_PROJECT_TAGS = ["hermes"];
const RESERVED_BOARD_TAGS = new Set([
  ...OPENCLAW_PROJECTS,
  ...LEGACY_PROJECT_TAGS,
  ...OPENCLAW_PROJECTS.flatMap((project) => OPENCLAW_CATEGORIES.map((category) => CATEGORY_TAGS[project][category])),
]);

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}

function dedupeTags(tags: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim();
    if (!cleaned) continue;
    const normalized = normalizeTag(cleaned);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(cleaned);
  }

  return result;
}

export function isOpenclawProject(value: unknown): value is OpenclawProject {
  return typeof value === "string" && (OPENCLAW_PROJECTS as string[]).includes(value);
}

export function isOpenclawCategory(value: unknown): value is OpenclawCategory {
  return typeof value === "string" && (OPENCLAW_CATEGORIES as string[]).includes(value);
}

export function getProjectFromTags(tags: string[]): OpenclawProject | null {
  const normalized = new Set(tags.map(normalizeTag));

  // Canonical project tags win over legacy aliases. A row tagged both
  // `openclaw` and legacy `Hermes` belongs to OpenClaw, not Hermes Agent.
  if (normalized.has("openclaw")) return "openclaw";
  if (normalized.has("hermes-agent") || normalized.has("hermes")) return "hermes-agent";

  return null;
}

export function getCategoryFromTags(tags: string[], project: OpenclawProject): OpenclawCategory {
  const normalized = new Set(tags.map(normalizeTag));

  for (const category of OPENCLAW_CATEGORIES) {
    if (normalized.has(CATEGORY_TAGS[project][category])) return category;
  }

  return "news";
}

export function buildOpenclawBoardTags(inputTags: string[] = [], params: { project?: OpenclawProject; category?: OpenclawCategory } = {}) {
  const project = params.project ?? "openclaw";
  const category = params.category ?? "news";
  const sanitized = inputTags.filter((tag) => !RESERVED_BOARD_TAGS.has(normalizeTag(tag)));

  return dedupeTags([...sanitized, project, CATEGORY_TAGS[project][category]]);
}
