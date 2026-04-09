import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SLACK_CHANNEL_ID = "C0AS5JSTU4R";
const URL_REGEX = /https?:\/\/[^\s<>|)]+/g;

// 진입 기준 키워드
const PASS_KEYWORDS = [
  "api", "sdk", "open source", "오픈소스", "launch", "release", "출시", "공개",
  "beta", "베타", "ga ", "general availability", "model", "모델", "llm",
  "agent", "에이전트", "platform", "플랫폼", "framework", "프레임워크",
  "huggingface", "github.com", "docs.", "documentation", "규제", "정책",
  "지원사업", "바우처", "공모", "오픈 베타",
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

async function postSlackMessage(text: string, threadTs?: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: SLACK_CHANNEL_ID,
      text,
      ...(threadTs ? { thread_ts: threadTs } : {}),
    }),
  });
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

async function processUrl(url: string, slackTs: string) {
  await postSlackMessage(`🔍 링크 분석 중...`, slackTs);

  // 1. URL 내용 가져오기
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)", Accept: "text/html" },
    });
    if (!res.ok) {
      await postSlackMessage(`⚠️ URL 접근 실패 (${res.status})`, slackTs);
      return;
    }
    html = await res.text();
  } catch {
    await postSlackMessage(`⚠️ URL을 가져올 수 없습니다.`, slackTs);
    return;
  }

  // 2. 메타 정보 추출
  const meta = extractMeta(html);
  const fullText = `${meta.title} ${meta.description} ${url}`.toLowerCase();

  // 3. 기준 판정
  const hasReject = REJECT_KEYWORDS.some((k) => fullText.includes(k));
  if (hasReject) {
    await postSlackMessage(`❌ 기준 미달: 투자/벤치마크/밈 관련 콘텐츠입니다.\n제목: ${meta.title}`, slackTs);
    return;
  }

  const passCount = PASS_KEYWORDS.filter((k) => fullText.includes(k)).length;
  if (passCount < 2) {
    await postSlackMessage(
      `❌ 기준 미달: 빌더가 만드는 방식을 바꾸는 변화가 아닌 것 같습니다.\n` +
      `제목: ${meta.title}\n` +
      `매칭 키워드: ${passCount}개 (최소 2개 필요)`,
      slackTs
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
    await postSlackMessage(`⚠️ DB 설정이 없어서 등록할 수 없습니다.`, slackTs);
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
    await postSlackMessage(`⚠️ DB 저장 실패: ${error.message}`, slackTs);
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
    `🔗 https://thenocodes.org/signals`,
    slackTs
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
        processUrl(firstUrl, event.ts).catch(console.error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
