import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SLACK_CHANNEL_ID = "C0AS5JSTU4R";
const URL_REGEX = /https?:\/\/[^\s<>|)]+/g;

async function postSlackMessage(text: string, thread_ts?: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  const body: Record<string, string> = { channel: SLACK_CHANNEL_ID, text };
  if (thread_ts) body.thread_ts = thread_ts;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function saveToQueue(url: string, userName: string, slackTs: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 중복 체크
  const { data: existing } = await supabase
    .from("pending_signals")
    .select("id")
    .eq("url", url)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    await postSlackMessage(`이미 대기열에 있는 링크입니다: ${url}`, slackTs);
    return;
  }

  const { error } = await supabase.from("pending_signals").insert({
    url,
    submitted_by: userName,
    slack_channel: SLACK_CHANNEL_ID,
    slack_ts: slackTs,
  });

  if (error) {
    await postSlackMessage(`⚠️ 대기열 저장 실패: ${error.message}`, slackTs);
    return;
  }

  await postSlackMessage(
    `📥 링크 접수 완료. AI 검토 대기 중입니다.\n` +
    `Claude에게 "슬랙 링크 처리해"라고 하면 검토가 시작됩니다.`,
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
        const userName = event.user ?? "unknown";
        const slackTs = event.ts ?? "";

        saveToQueue(firstUrl, userName, slackTs).catch(console.error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
