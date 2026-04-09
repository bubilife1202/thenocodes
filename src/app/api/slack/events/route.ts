import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SLACK_CHANNEL_ID = "C0AS5JSTU4R";
const URL_REGEX = /https?:\/\/[^\s<>|)]+/g;

// 진입 기준 키워드 — URL, 제목, 설명에서 매칭
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

const REJECT_KEYWORDS = [
  "투자", "인수", "funding", "acquisition", "valuation", "밸류",
  "benchmark", "벤치마크", "순위", "ranking",
  "밈", "meme", "재미", "웃긴",
  "루머", "rumor", "소문",
];

// signal_type 자동 분류
function classifySignalType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("오픈소스") || lower.includes("open source") || lower.includes("huggingface") || lower.includes("model") || lower.includes("모델") || lower.includes("가중치") || lower.includes("weight")) return "open_model";
  if (lower.includes("정책") || lower.includes("규제") || lower.includes("policy") || lower.includes("지원사업") || lower.includes("바우처")) return "policy";
  if (lower.includes("platform") || lower.includes("플랫폼") || lower.includes("managed") || lower.includes("infrastructure") || lower.includes("인프라")) return "platform_launch";
  return "api_tool";
}

async function postSlackMessage(text: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is missing");
    return;
  }

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: SLACK_CHANNEL_ID, text }),
  });

  const data = await res.json() as { ok: boolean; error?: string };
  if (!data.ok) console.error("Slack postMessage error:", data.error);
}

function extractMeta(html: string) {
  const getContent = (key: string) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"))
      ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, "i"));
    return m?.[1]?.trim() ?? "";
  };
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return {
    title: getContent("og:title") || titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "",
    description: getContent("og:description") || getContent("description") || "",
    siteName: getContent("og:site_name") || "",
  };
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function processUrl(url: string, slackText?: string) {
  await postSlackMessage(`🔍 링크 분석 중...`);

  // 1. URL 내용 가져오기 (실패해도 계속 진행)
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
    });
    if (res.ok) {
      html = await res.text();
    }
  } catch {
    // URL 접근 실패해도 URL 자체와 슬랙 텍스트로 판정 계속
  }

  // 2. 메타 정보 추출 (HTML이 없으면 URL과 슬랙 텍스트에서 추출)
  const meta = html ? extractMeta(html) : { title: "", description: "", siteName: "" };

  // HTML에서 못 가져왔으면 URL 경로와 슬랙 텍스트에서 제목 추출
  if (!meta.title) {
    // URL 경로에서 제목 추출 (예: /blog/claude-managed-agents → claude managed agents)
    const pathTitle = new URL(url).pathname.split("/").pop()?.replace(/[-_]/g, " ").trim() ?? "";
    meta.title = slackText?.replace(/<[^>]+>/g, "").replace(url, "").trim() || pathTitle || url;
  }
  if (!meta.siteName) {
    meta.siteName = new URL(url).hostname.replace("www.", "");
  }
  const fullText = `${meta.title} ${meta.description} ${url}`.toLowerCase();

  // 3. 기준 판정
  const hasReject = REJECT_KEYWORDS.some((k) => fullText.includes(k));
  if (hasReject) {
    await postSlackMessage(`❌ 기준 미달: 투자/벤치마크/밈 관련 콘텐츠입니다.\n제목: ${meta.title}`);
    return;
  }

  const matchedKeywords = PASS_KEYWORDS.filter((k) => fullText.includes(k));
  if (matchedKeywords.length === 0) {
    await postSlackMessage(
      `❌ 기준 미달: 빌더가 만드는 방식을 바꾸는 변화가 아닌 것 같습니다.\n` +
      `제목: ${meta.title}`
    );
    return;
  }

  // 4. 시그널 데이터 생성
  const signalType = classifySignalType(fullText);
  const title = meta.title || url;
  const slug = toSlug(title);
  const summary = meta.description || title;

  // 5. DB에 추가
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    await postSlackMessage(`⚠️ DB 설정이 없어서 등록할 수 없습니다.`);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase.from("builder_signals").upsert(
    {
      slug: slug || `signal-${Date.now()}`,
      title,
      summary: summary.slice(0, 500),
      action_point: "원본 문서를 확인하고 바로 써보세요.",
      source_url: url,
      source_name: meta.siteName || new URL(url).hostname,
      signal_type: signalType,
      tags: ["AI", "자동등록"],
      published_at: new Date().toISOString(),
      is_featured: true,
    },
    { onConflict: "slug" }
  );

  if (error) {
    await postSlackMessage(`⚠️ DB 저장 실패: ${error.message}`);
    return;
  }

  const typeLabels: Record<string, string> = {
    platform_launch: "플랫폼",
    api_tool: "API·도구",
    open_model: "오픈소스",
    policy: "정책",
  };

  await postSlackMessage(
    `✅ 흐름에 자동 등록 완료!\n\n` +
    `📌 ${title}\n` +
    `🏷️ ${typeLabels[signalType] || signalType}\n` +
    `📝 ${summary.slice(0, 100)}...\n\n` +
    `🔗 https://thenocodes.org/signals`
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  // Slack URL verification
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  if (body.type === "event_callback") {
    const event = body.event;

    // 봇 자신 메시지 무시
    if (event.bot_id || event.subtype === "bot_message") {
      return NextResponse.json({ ok: true });
    }

    // #흐름-링크 채널 메시지만 처리
    if (event.type === "message" && event.channel === SLACK_CHANNEL_ID) {
      const text = event.text ?? "";
      const urls = text.match(URL_REGEX);

      if (urls && urls.length > 0) {
        const firstUrl = urls[0].replace(/[>|].*$/, "");
        try {
          await processUrl(firstUrl, text);
        } catch (err) {
          console.error("processUrl error:", err);
          await postSlackMessage(`⚠️ 처리 중 에러: ${String(err)}`);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
