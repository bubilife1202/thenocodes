import { SIGNAL_TYPE_VALUES, type SignalType } from "@/lib/signals/constants";

export type SignalDraft = {
  title: string;
  summary: string;
  actionPoint: string;
  sourceUrl: string;
  sourceName: string;
  signalType: SignalType;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
};

const PASS_KEYWORDS = [
  "api", "sdk", "open source", "오픈소스", "launch", "release", "출시", "공개",
  "beta", "베타", "general availability", "model", "모델", "llm",
  "agent", "에이전트", "platform", "플랫폼", "framework", "프레임워크",
  "huggingface", "github.com", "docs.", "documentation", "규제", "정책",
  "지원사업", "바우처", "공모", "오픈 베타",
  "anthropic", "openai", "google ai", "gemini", "claude", "gpt",
  "scaling", "deploy", "배포", "inference", "추론", "fine-tun", "파인튜닝",
  "open weight", "tool", "도구", "runtime", "sandbox", "샌드박스",
  "managed", "serverless", "cloud", "클라우드",
];

const HARD_REJECT_KEYWORDS = [
  "투자", "인수", "funding", "acquisition", "valuation", "밸류",
  "밈", "meme", "재미", "웃긴",
  "루머", "rumor", "소문",
];

type UrlMeta = {
  title: string;
  description: string;
  siteName: string;
};

function classifySignalType(text: string): SignalType {
  const lower = text.toLowerCase();

  if (lower.includes("glm-") || lower.includes("zai-org/glm") || lower.includes("open-weight")) {
    return "open_model";
  }

  if (
    lower.includes("오픈소스") ||
    lower.includes("open source") ||
    lower.includes("huggingface") ||
    lower.includes("model") ||
    lower.includes("모델") ||
    lower.includes("가중치") ||
    lower.includes("weight")
  ) {
    return "open_model";
  }

  if (
    lower.includes("정책") ||
    lower.includes("규제") ||
    lower.includes("policy") ||
    lower.includes("지원사업") ||
    lower.includes("바우처")
  ) {
    return "policy";
  }

  if (
    lower.includes("platform") ||
    lower.includes("플랫폼") ||
    lower.includes("managed") ||
    lower.includes("infrastructure") ||
    lower.includes("인프라")
  ) {
    return "platform_launch";
  }

  return "api_tool";
}

function extractMeta(html: string): UrlMeta {
  const getContent = (key: string) => {
    const match =
      html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i")) ??
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, "i"));

    return match?.[1]?.trim() ?? "";
  };

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return {
    title: getContent("og:title") || titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "",
    description: getContent("og:description") || getContent("description") || "",
    siteName: getContent("og:site_name") || "",
  };
}

function cleanTitle(rawTitle: string, siteName: string) {
  const trimmed = rawTitle
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .trim();

  const separators = [" | ", " - ", " — ", " · "];
  for (const separator of separators) {
    const parts = trimmed.split(separator).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const withoutSite = parts.filter((part) => part.toLowerCase() !== siteName.toLowerCase());
      if (withoutSite.length > 0) {
        const candidate = withoutSite[0];
        const githubRepoMatch = candidate.match(/^[^/]+\/([^:]+):\s*(.+)$/);
        if (githubRepoMatch) {
          return `${githubRepoMatch[1]} ${githubRepoMatch[2]}`.trim();
        }
        return candidate;
      }
    }
  }

  const githubRepoMatch = trimmed.match(/^[^/]+\/([^:]+):\s*(.+)$/);
  if (githubRepoMatch) {
    return `${githubRepoMatch[1]} ${githubRepoMatch[2]}`.trim();
  }

  return trimmed;
}

function titleCaseWords(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferSourceName(siteName: string, hostname: string, pathname = "") {
  if (siteName && siteName.toLowerCase() !== "github") return siteName;

  const normalized = hostname.replace(/^www\./, "");
  if (normalized === "claude.com") return "Anthropic";
  if (normalized === "workspaceupdates.googleblog.com") return "Google Workspace";
  if (normalized === "huggingface.co") return "Hugging Face";
  if (normalized === "news.hada.io") return "뉴스하다";
  if (normalized === "github.com") {
    const owner = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (owner === "zai-org") return "Z.ai";
    if (owner === "lgai-exaone") return "LG AI Research";
    return "GitHub";
  }

  return titleCaseWords(normalized.replace(/\.(com|ai|io|dev|org|co|net)$/i, ""));
}

function formatTitle(baseTitle: string, signalType: SignalType, sourceName: string) {
  const clean = cleanTitle(baseTitle, sourceName);

  if (sourceName === "Z.ai" && /GLM-5/i.test(clean)) {
    return "Z.ai GLM-5.1 공개, 장시간 에이전트 작업용 오픈웨이트 모델";
  }

  if (signalType === "open_model") {
    if (/(오픈소스|오픈웨이트|가중치 공개)/.test(clean)) return clean;
    if (/open weight|open-weight|open source/i.test(clean)) {
      return clean
        .replace(/Open-Weight/gi, "오픈웨이트")
        .replace(/Open Source/gi, "오픈소스")
        .replace(/Introduces?/gi, "공개")
        .trim();
    }
    return clean;
  }

  if (signalType === "platform_launch") {
    if (/beta|public beta/i.test(clean) && !clean.includes("베타")) {
      return `${clean.replace(/beta|public beta/gi, "").trim()} 공개 베타`;
    }
    return clean;
  }

  return clean;
}

function buildSummary(metaTitle: string, metaDescription: string, signalType: SignalType, sourceName: string) {
  const description = metaDescription
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .trim();

  if (sourceName === "Z.ai" && /GLM-5/i.test(metaTitle)) {
    return "Z.ai가 GLM-5.1을 GitHub와 API 문서 기준으로 공개했다. 코딩과 장시간 에이전트 작업을 전면에 내세우는 오픈웨이트 모델 계열로, 리포지토리와 플랫폼 문서를 통해 구조와 사용 경로를 확인할 수 있다.";
  }

  if (description.length >= 80) {
    return description.slice(0, 220).trim();
  }

  if (signalType === "open_model") {
    return `${sourceName}에서 새 오픈 모델 관련 업데이트를 공개했다. 모델 카드와 공식 문서를 기준으로 실제 사용 경로와 적용 포인트를 확인해볼 수 있다.`;
  }

  if (signalType === "platform_launch") {
    return `${sourceName}에서 빌더 워크플로우에 직접 영향을 주는 플랫폼 업데이트를 공개했다. 운영 부담을 줄이거나 장시간 실행, 협업, 배포 흐름을 바꾸는지 확인할 가치가 있다.`;
  }

  if (signalType === "policy") {
    return `${sourceName}에서 정책 또는 지원사업 변화가 나왔다. 실제 신청 조건과 적용 대상, 팀 운영에 미치는 영향을 먼저 확인하는 게 좋다.`;
  }

  return `${sourceName}에서 새 도구 또는 API 관련 변화를 공개했다. 공식 문서와 적용 예시를 함께 보면서 바로 써볼 수 있는지 판단해볼 만하다.`;
}

function buildActionPoint(signalType: SignalType, sourceUrl: string, sourceName?: string, metaTitle?: string) {
  if (sourceName === "Z.ai" && metaTitle && /GLM-5/i.test(metaTitle)) {
    return "공식 GitHub 리포지토리와 API 문서를 먼저 확인하고, 코딩 에이전트나 터미널 작업 자동화가 필요한 프로젝트에서 기존 모델과 비교 테스트해보세요.";
  }

  if (signalType === "open_model") {
    return `공식 리포지토리나 모델 카드(${sourceUrl})를 먼저 확인하고, 기존에 쓰던 모델과 입력 품질·속도·비용 관점에서 비교 테스트해보세요.`;
  }

  if (signalType === "platform_launch") {
    return `공식 문서와 예시를 먼저 확인하고, 지금 운영 중인 자동화나 에이전트 플로우에 붙였을 때 줄어드는 작업이 무엇인지부터 작은 범위로 검증해보세요.`;
  }

  if (signalType === "policy") {
    return `공식 공고와 세부 조건을 먼저 읽고, 우리 팀이나 프로젝트가 실제로 해당되는지 체크리스트부터 만들어보세요.`;
  }

  return `공식 문서를 열어 최소 예제부터 확인하고, 지금 쓰는 도구 체인에 바로 붙여볼 수 있는지 작은 실험부터 해보세요.`;
}

function buildTags(title: string, sourceName: string, signalType: SignalType) {
  const tags = new Set<string>(["AI"]);
  if (signalType === "open_model") tags.add("오픈소스");
  if (signalType === "platform_launch") tags.add("플랫폼");
  if (signalType === "api_tool") tags.add("API");
  if (signalType === "policy") tags.add("정책");

  const lower = `${title} ${sourceName}`.toLowerCase();
  if (lower.includes("agent")) tags.add("Agent");
  if (lower.includes("claude")) tags.add("Anthropic");
  if (lower.includes("openai")) tags.add("OpenAI");
  if (lower.includes("google")) tags.add("Google");
  if (lower.includes("glm")) tags.add("GLM");
  if (lower.includes("z.ai") || lower.includes("zai-org")) tags.add("Z.ai");
  if (lower.includes("exaone") || lower.includes("엑사원")) tags.add("EXAONE");
  if (lower.includes("korean") || lower.includes("한국어")) tags.add("한국어");
  if (lower.includes("coding")) tags.add("Coding");

  return Array.from(tags).slice(0, 5);
}

export async function fetchSignalMeta(url: string, fallbackText?: string) {
  let html = "";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (response.ok) {
      html = await response.text();
    }
  } catch {
    // fetch 실패 시 fallbackText 사용
  }

  const meta = html ? extractMeta(html) : { title: "", description: "", siteName: "" };
  const parsedUrl = new URL(url);

  if (!meta.title) {
    const pathTitle = parsedUrl.pathname.split("/").pop()?.replace(/[-_]/g, " ").trim() ?? "";
    meta.title = fallbackText?.replace(/<[^>]+>/g, "").replace(url, "").trim() || pathTitle || url;
  }

  if (!meta.siteName) {
    meta.siteName = inferSourceName("", parsedUrl.hostname, parsedUrl.pathname);
  }

  return meta;
}

export function getRejectReason(fullText: string) {
  const lower = fullText.toLowerCase();

  if (HARD_REJECT_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return "투자·루머·밈성 콘텐츠는 흐름에 바로 올리지 않습니다.";
  }

  const matchedKeywords = PASS_KEYWORDS.filter((keyword) => lower.includes(keyword));
  if (matchedKeywords.length === 0) {
    return "빌더가 만드는 방식을 바꾸는 변화인지가 불분명합니다.";
  }

  return null;
}

export async function generateSignalDraft(url: string, fallbackText?: string): Promise<SignalDraft> {
  const meta = await fetchSignalMeta(url, fallbackText);
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const sourceName = inferSourceName(meta.siteName, hostname, parsedUrl.pathname);
  const fullText = `${meta.title} ${meta.description} ${url}`.toLowerCase();
  const signalType = classifySignalType(fullText);

  return {
    title: formatTitle(meta.title, signalType, sourceName),
    summary: buildSummary(meta.title, meta.description, signalType, sourceName),
    actionPoint: buildActionPoint(signalType, url, sourceName, meta.title),
    sourceUrl: url,
    sourceName,
    signalType,
    tags: buildTags(meta.title, sourceName, signalType),
    metaTitle: meta.title,
    metaDescription: meta.description,
  };
}

export function isSignalType(value?: string): value is SignalType {
  return SIGNAL_TYPE_VALUES.includes(value as SignalType);
}
