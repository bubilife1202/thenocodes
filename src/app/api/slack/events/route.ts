import { NextResponse } from "next/server";

const SLACK_CHANNEL_ID = "C0AS5JSTU4R";

// URL 추출 정규식
const URL_REGEX = /https?:\/\/[^\s<>|]+/g;

async function postSlackMessage(text: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel: SLACK_CHANNEL_ID, text }),
  });
}

async function fetchAndEvaluateUrl(url: string): Promise<{
  pass: boolean;
  reason: string;
  signal?: {
    title: string;
    summary: string;
    action_point: string;
    source_url: string;
    source_name: string;
    signal_type: string;
    tags: string[];
  };
}> {
  // URL 내용 가져오기
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)", Accept: "text/html" },
  });

  if (!res.ok) {
    return { pass: false, reason: `URL 접근 실패 (${res.status})` };
  }

  const html = await res.text();

  // 메타 태그에서 기본 정보 추출
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  const descMatch = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:description"|name="description")/i);
  const description = descMatch?.[1]?.trim() ?? "";

  const siteNameMatch = html.match(/<meta[^>]+property="og:site_name"[^>]+content="([^"]+)"/i);
  const siteName = siteNameMatch?.[1]?.trim() ?? new URL(url).hostname;

  // Claude API로 판정 (없으면 키워드 기반 판정)
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: `다음 URL의 내용을 평가해줘.

제목: ${title}
설명: ${description}
URL: ${url}
출처: ${siteName}

판정 기준:
- O: API/SDK 공개, 오픈소스 모델 가중치 공개, 빌더 도구/플랫폼 대규모 업데이트, 한국 AI 정책/규제 변화
- X: 투자/인수 가십, 벤치마크만 있는 발표, 밈, 추상적 비전 발표, B2C 앱 출시(API 없음), 개인 블로그 분석글

핵심 질문: "이걸로 빌더가 만드는 방식이 바뀌는가?"

JSON으로 답변해줘 (다른 텍스트 없이 JSON만):
{
  "pass": true/false,
  "reason": "판정 이유 한 줄",
  "title": "한국어 제목",
  "summary": "2-3문장 요약",
  "action_point": "빌더가 당장 해볼 것",
  "source_name": "출처 이름",
  "signal_type": "platform_launch|api_tool|open_model|policy",
  "tags": ["태그1", "태그2"]
}`,
          }],
        }),
      });

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json();
        const content = claudeData.content?.[0]?.text ?? "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);

          if (!result.pass) {
            return { pass: false, reason: result.reason };
          }

          return {
            pass: true,
            reason: result.reason,
            signal: {
              title: result.title || title,
              summary: result.summary,
              action_point: result.action_point,
              source_url: url,
              source_name: result.source_name || siteName,
              signal_type: result.signal_type || "api_tool",
              tags: result.tags || [],
            },
          };
        }
      }
    } catch (err) {
      console.error("Claude API error:", err);
    }
  }

  // Claude API 없으면 키워드 기반 간단 판정
  const text = `${title} ${description}`.toLowerCase();
  const actionKeywords = ["api", "sdk", "open source", "오픈소스", "launch", "release", "출시", "공개", "beta"];
  const hasAction = actionKeywords.some((k) => text.includes(k));

  if (!hasAction) {
    return { pass: false, reason: "API/도구 출시 관련 키워드가 없습니다. Claude API 키를 설정하면 더 정확한 판정이 가능합니다." };
  }

  return {
    pass: true,
    reason: "키워드 기반 판정 (Claude API 키 설정 시 정밀 판정 가능)",
    signal: {
      title,
      summary: description.slice(0, 200),
      action_point: "원본 문서를 확인하세요.",
      source_url: url,
      source_name: siteName,
      signal_type: "api_tool",
      tags: ["AI"],
    },
  };
}

async function processUrl(url: string) {
  await postSlackMessage(`🔍 링크 분석 중: ${url}`);

  const result = await fetchAndEvaluateUrl(url);

  if (!result.pass) {
    await postSlackMessage(`❌ 기준 미달: ${result.reason}\n링크: ${url}`);
    return;
  }

  // DB에 추가
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || !result.signal) {
    await postSlackMessage(`⚠️ 판정은 O이지만 DB 설정이 없어서 등록하지 못했습니다.\n제목: ${result.signal?.title}\n이유: ${result.reason}`);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const slug = result.signal.title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const { error } = await supabase.from("builder_signals").upsert(
    {
      slug,
      title: result.signal.title,
      summary: result.signal.summary,
      action_point: result.signal.action_point,
      source_url: result.signal.source_url,
      source_name: result.signal.source_name,
      signal_type: result.signal.signal_type,
      tags: result.signal.tags,
      published_at: new Date().toISOString(),
      is_featured: true,
    },
    { onConflict: "slug" }
  );

  if (error) {
    await postSlackMessage(`⚠️ DB 저장 실패: ${error.message}\n제목: ${result.signal.title}`);
    return;
  }

  await postSlackMessage(
    `✅ 흐름에 등록 완료!\n` +
    `📌 ${result.signal.title}\n` +
    `🏷️ ${result.signal.signal_type}\n` +
    `💡 ${result.signal.action_point}\n` +
    `🔗 https://thenocodes.org/signals`
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  // Slack URL verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Event callback
  if (body.type === "event_callback") {
    const event = body.event;

    // 봇 자신의 메시지 무시
    if (event.bot_id || event.subtype === "bot_message") {
      return NextResponse.json({ ok: true });
    }

    // #흐름-링크 채널의 메시지만 처리
    if (event.type === "message" && event.channel === SLACK_CHANNEL_ID) {
      const text = event.text ?? "";
      const urls = text.match(URL_REGEX);

      if (urls && urls.length > 0) {
        // 비동기로 처리 (Slack 3초 제한 대응)
        const firstUrl = urls[0].replace(/[>|].*$/, "");
        processUrl(firstUrl).catch(console.error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
