import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSignalDraft, getRejectReason } from "@/lib/signals/draft";

const SLACK_CHANNEL_ID = "C0AS5JSTU4R";
const URL_REGEX = /https?:\/\/[^\s<>|)]+/g;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thenocodes.org";

type SlackMessageEvent = {
  type?: string;
  channel?: string;
  text?: string;
  user?: string;
  ts?: string;
  thread_ts?: string;
  bot_id?: string;
  subtype?: string;
};

type SlackBlock = Record<string, unknown>;

type QueueResult = {
  kind: "queued" | "already_live" | "already_pending" | "rejected" | "error";
  title: string;
  detail?: string;
  pendingId?: string;
  reviewUrl?: string;
  sourceUrl?: string;
  signalTypeLabel?: string;
  summary?: string;
  actionPoint?: string;
};

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

function signalTypeLabel(value?: string) {
  const labels: Record<string, string> = {
    platform_launch: "플랫폼",
    api_tool: "API·도구",
    open_model: "오픈소스",
    policy: "정책",
  };

  return value ? labels[value] ?? value : undefined;
}

async function postSlackMessage(params: { text: string; threadTs?: string; blocks?: SlackBlock[] }) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is missing");
    return;
  }

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: SLACK_CHANNEL_ID,
      text: params.text,
      ...(params.threadTs ? { thread_ts: params.threadTs } : {}),
      ...(params.blocks ? { blocks: params.blocks } : {}),
    }),
  });

  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    console.error("Slack postMessage error:", data.error);
  }
}

async function processUrl(params: {
  url: string;
  slackText?: string;
  submittedBy?: string;
  slackChannel?: string;
  slackTs?: string;
}): Promise<QueueResult> {
  const { url, slackText, submittedBy, slackChannel, slackTs } = params;
  const draft = await generateSignalDraft(url, slackText);
  const fullText = `${draft.metaTitle} ${draft.metaDescription} ${url}`.toLowerCase();
  const rejectReason = getRejectReason(fullText);

  const supabase = getAdminSupabase();
  if (!supabase) {
    return {
      kind: "error",
      title: draft.title,
      detail: "DB 설정이 없어 대기열에 저장하지 못했습니다.",
    };
  }

  const { data: liveRows, error: liveError } = await supabase
    .from("builder_signals")
    .select("id,title")
    .eq("source_url", url)
    .limit(1);

  if (liveError) {
    return {
      kind: "error",
      title: draft.title,
      detail: `공개 목록 확인 실패: ${liveError.message}`,
    };
  }

  if ((liveRows ?? []).length > 0) {
    return {
      kind: "already_live",
      title: liveRows?.[0]?.title || draft.title,
    };
  }

  const { data: pendingRows, error: pendingError } = await supabase
    .from("pending_signals")
    .select("id,status")
    .eq("url", url)
    .eq("status", "pending")
    .limit(1);

  if (pendingError) {
    return {
      kind: "error",
      title: draft.title,
      detail: `대기열 확인 실패: ${pendingError.message}`,
    };
  }

  if ((pendingRows ?? []).length > 0) {
    const pendingId = pendingRows?.[0]?.id as string;
    return {
      kind: "already_pending",
      title: draft.title,
      pendingId,
      reviewUrl: `${SITE_URL}/signals/pending/${pendingId}`,
    };
  }

  if (rejectReason) {
    const { error } = await supabase.from("pending_signals").insert({
      url,
      submitted_by: submittedBy ?? null,
      slack_channel: slackChannel ?? null,
      slack_ts: slackTs ?? null,
      status: "rejected",
      reject_reason: rejectReason,
    });

    if (error) {
      return {
        kind: "error",
        title: draft.title,
        detail: `보류 기록 실패: ${error.message}`,
      };
    }

    return {
      kind: "rejected",
      title: draft.title,
      detail: rejectReason,
      sourceUrl: url,
    };
  }

  const { data: inserted, error } = await supabase
    .from("pending_signals")
    .insert({
      url,
      submitted_by: submittedBy ?? null,
      slack_channel: slackChannel ?? null,
      slack_ts: slackTs ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return {
      kind: "error",
      title: draft.title,
      detail: `대기열 저장 실패: ${error.message}`,
    };
  }

  const pendingId = inserted.id as string;
  return {
    kind: "queued",
    title: draft.title,
    pendingId,
    reviewUrl: `${SITE_URL}/signals/pending/${pendingId}`,
    sourceUrl: draft.sourceUrl,
    signalTypeLabel: signalTypeLabel(draft.signalType),
    summary: draft.summary,
    actionPoint: draft.actionPoint,
  };
}

function buildBlocks(results: QueueResult[]) {
  const blocks: SlackBlock[] = [];

  for (const result of results) {
    if (result.kind === "queued") {
      blocks.push(
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*대기열 등록 완료*\n` +
              `• 제목: ${result.title}\n` +
              `• 분류: ${result.signalTypeLabel}\n` +
              `• 요약 초안: ${result.summary}\n` +
              `• 액션 초안: ${result.actionPoint}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "승인" },
              style: "primary",
              action_id: "approve_signal",
              value: result.pendingId,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "수정 요청" },
              url: `${result.reviewUrl}?mode=edit`,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "반려" },
              style: "danger",
              action_id: "reject_signal",
              value: result.pendingId,
            },
            {
              type: "button",
              text: { type: "plain_text", text: "원문 확인" },
              url: result.sourceUrl,
            },
          ],
        },
        { type: "divider" }
      );
      continue;
    }

    if (result.kind === "already_pending") {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*이미 검토 대기중*\n• ${result.title}` },
        accessory: result.reviewUrl
          ? {
              type: "button",
              text: { type: "plain_text", text: "검토 열기" },
              url: result.reviewUrl,
            }
          : undefined,
      });
      continue;
    }

    if (result.kind === "already_live") {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*이미 공개됨*\n• ${result.title}` },
      });
      continue;
    }

    if (result.kind === "rejected") {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*보류*\n• ${result.title}\n• 사유: ${result.detail}` },
      });
      continue;
    }

    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*오류*\n• ${result.title}\n• ${result.detail}` },
    });
  }

  return blocks;
}

function formatSlackText(results: QueueResult[]) {
  const lines = results.map((result) => {
    switch (result.kind) {
      case "queued":
        return `• 대기열 등록: [${result.signalTypeLabel}] ${result.title}`;
      case "already_live":
        return `• 이미 공개됨: ${result.title}`;
      case "already_pending":
        return `• 이미 검토 대기중: ${result.title}`;
      case "rejected":
        return `• 보류: ${result.title} — ${result.detail}`;
      default:
        return `• 오류: ${result.title} — ${result.detail}`;
    }
  });

  return [
    "📝 흐름 링크 접수 결과",
    ...lines,
    "",
    "공개 전에는 원문 확인, 공식 출처 확인, 제목/요약/액션 포인트 정제를 거칩니다.",
  ].join("\n");
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  if (body.type === "event_callback") {
    const event = body.event as SlackMessageEvent;

    if (event.bot_id || event.subtype === "bot_message") {
      return NextResponse.json({ ok: true });
    }

    if (event.type === "message" && event.channel === SLACK_CHANNEL_ID) {
      const text = event.text ?? "";
      const urls = [...new Set((text.match(URL_REGEX) ?? []).map((rawUrl) => rawUrl.replace(/[>|].*$/, "")))];

      if (urls.length > 0) {
        try {
          const results: QueueResult[] = [];
          for (const url of urls) {
            results.push(
              await processUrl({
                url,
                slackText: text,
                submittedBy: event.user,
                slackChannel: event.channel,
                slackTs: event.ts,
              })
            );
          }

          await postSlackMessage({
            text: formatSlackText(results),
            threadTs: event.thread_ts ?? event.ts,
            blocks: buildBlocks(results),
          });
        } catch (error) {
          console.error("processUrl error:", error);
          await postSlackMessage({
            text: `⚠️ 링크 처리 중 에러: ${String(error)}`,
            threadTs: event.thread_ts ?? event.ts,
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
