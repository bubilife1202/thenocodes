import { NextResponse } from "next/server";
import { createSignalSlug } from "@/lib/signals/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSignalDraft } from "@/lib/signals/draft";

type SlackActionPayload = {
  type: string;
  user?: { id?: string; username?: string };
  channel?: { id?: string; name?: string };
  container?: { message_ts?: string; thread_ts?: string };
  message?: { ts?: string };
  actions?: Array<{ action_id?: string; value?: string }>;
};

async function postSlackMessage(text: string, threadTs?: string | null) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: "C0AS5JSTU4R",
      text,
      ...(threadTs ? { thread_ts: threadTs } : {}),
    }),
  });
}

async function updateSlackMessage(params: {
  ts?: string;
  status: "approved" | "rejected";
  title: string;
  reviewUrl?: string;
}) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !params.ts) return;

  const statusText = params.status === "approved" ? "승인 완료" : "반려 완료";
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*${statusText}*\n` +
          `• 제목: ${params.title}` +
          (params.status === "approved" ? "\n• 홈페이지 반영이 끝났습니다." : "\n• 더노코즈 흐름 기준에 맞지 않아 보류했습니다."),
      },
    },
  ] as Record<string, unknown>[];

  if (params.reviewUrl && params.status === "rejected") {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "검토 페이지 열기" },
          url: params.reviewUrl,
        },
      ],
    });
  }

  await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: "C0AS5JSTU4R",
      ts: params.ts,
      text: `${statusText}: ${params.title}`,
      blocks,
    }),
  });
}

async function createApprovedSignalFromPending(pendingId: string) {
  const supabase = createAdminClient();
  const { data: pending, error: pendingError } = await supabase
    .from("pending_signals")
    .select("id,url,status,slack_ts")
    .eq("id", pendingId)
    .maybeSingle();

  if (pendingError || !pending) {
    return { ok: false as const, error: "대기열 항목을 찾지 못했습니다." };
  }

  if (pending.status !== "pending") {
    return { ok: false as const, error: "이미 처리된 항목입니다." };
  }

  const draft = await generateSignalDraft(pending.url);
  let slug = createSignalSlug(draft.title) || `signal-${pending.id.slice(0, 8)}`;

  const { data: existing } = await supabase
    .from("builder_signals")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if ((existing ?? []).length > 0) {
    slug = `${slug}-${pending.id.slice(0, 6)}`;
  }

  const { error: insertError } = await supabase.from("builder_signals").insert({
    title: draft.title,
    slug,
    summary: draft.summary,
    action_point: draft.actionPoint,
    source_url: draft.sourceUrl,
    source_name: draft.sourceName,
    signal_type: draft.signalType,
    tags: draft.tags,
    published_at: new Date().toISOString(),
    is_featured: true,
  });

  if (insertError) {
    return { ok: false as const, error: `공개 등록 실패: ${insertError.message}` };
  }

  const { error: approveError } = await supabase
    .from("pending_signals")
    .update({ status: "approved", reject_reason: null })
    .eq("id", pendingId);

  if (approveError) {
    return { ok: false as const, error: `대기열 업데이트 실패: ${approveError.message}` };
  }

  return {
    ok: true as const,
    title: draft.title,
    slackTs: pending.slack_ts as string | null,
    reviewUrl: `https://thenocodes.org/signals/pending/${pendingId}`,
  };
}

async function rejectPendingSignal(pendingId: string) {
  const supabase = createAdminClient();
  const { data: pending, error: pendingError } = await supabase
    .from("pending_signals")
    .select("id,url,status,slack_ts")
    .eq("id", pendingId)
    .maybeSingle();

  if (pendingError || !pending) {
    return { ok: false as const, error: "대기열 항목을 찾지 못했습니다." };
  }

  if (pending.status !== "pending") {
    return { ok: false as const, error: "이미 처리된 항목입니다." };
  }

  const draft = await generateSignalDraft(pending.url);
  const { error: rejectError } = await supabase
    .from("pending_signals")
    .update({ status: "rejected", reject_reason: "슬랙에서 반려됨" })
    .eq("id", pendingId);

  if (rejectError) {
    return { ok: false as const, error: `반려 처리 실패: ${rejectError.message}` };
  }

  return {
    ok: true as const,
    title: draft.title,
    slackTs: pending.slack_ts as string | null,
    reviewUrl: `https://thenocodes.org/signals/pending/${pendingId}`,
  };
}

export async function POST(request: Request) {
  const form = await request.formData();
  const rawPayload = form.get("payload");

  if (typeof rawPayload !== "string") {
    return NextResponse.json({ ok: false, error: "Missing payload" }, { status: 400 });
  }

  const payload = JSON.parse(rawPayload) as SlackActionPayload;
  if (payload.type !== "block_actions") {
    return NextResponse.json({ ok: true });
  }

  const action = payload.actions?.[0];
  const pendingId = action?.value;
  const messageTs = payload.message?.ts || payload.container?.message_ts;

  if (!action?.action_id || !pendingId) {
    return NextResponse.json({ text: "처리할 대기열 항목을 찾지 못했습니다." });
  }

  if (action.action_id === "approve_signal") {
    const result = await createApprovedSignalFromPending(pendingId);
    if (!result.ok) {
      return NextResponse.json({ text: `승인 처리 실패: ${result.error}`, response_type: "ephemeral" });
    }

    await postSlackMessage(
      `✅ 흐름 등록 완료\n• ${result.title}\n• https://thenocodes.org/signals`,
      result.slackTs
    );
    await updateSlackMessage({ ts: messageTs, status: "approved", title: result.title });

    return NextResponse.json({ text: `승인 완료: ${result.title}`, response_type: "ephemeral" });
  }

  if (action.action_id === "reject_signal") {
    const result = await rejectPendingSignal(pendingId);
    if (!result.ok) {
      return NextResponse.json({ text: `반려 처리 실패: ${result.error}`, response_type: "ephemeral" });
    }

    await postSlackMessage(
      `❌ 흐름 반영 보류\n• ${result.title}\n• 필요하면 검토 페이지에서 수정 후 다시 올릴 수 있습니다.`,
      result.slackTs
    );
    await updateSlackMessage({ ts: messageTs, status: "rejected", title: result.title, reviewUrl: result.reviewUrl });

    return NextResponse.json({ text: `반려 완료: ${result.title}`, response_type: "ephemeral" });
  }

  if (action.action_id === "review_approve") {
    const feedbackId = action.value;
    if (!feedbackId) return NextResponse.json({ text: "ID 누락", response_type: "ephemeral" });
    const supabase = createAdminClient();
    const { data: item } = await supabase.from("feedback_items").select("id,title").eq("id", feedbackId).single();
    if (!item) return NextResponse.json({ text: "항목 없음", response_type: "ephemeral" });
    const { error } = await supabase.from("feedback_items").update({ status: "approved", is_public: true }).eq("id", feedbackId);
    if (error) return NextResponse.json({ text: `승인 실패: ${error.message}`, response_type: "ephemeral" });
    await updateSlackMessage({ ts: messageTs, status: "approved", title: item.title });
    return NextResponse.json({ text: `후기 승인: ${item.title}`, response_type: "ephemeral" });
  }

  if (action.action_id === "review_reject") {
    const feedbackId = action.value;
    if (!feedbackId) return NextResponse.json({ text: "ID 누락", response_type: "ephemeral" });
    const supabase = createAdminClient();
    const { data: item } = await supabase.from("feedback_items").select("id,title").eq("id", feedbackId).single();
    if (!item) return NextResponse.json({ text: "항목 없음", response_type: "ephemeral" });
    const { error } = await supabase.from("feedback_items").update({ status: "rejected", is_public: false }).eq("id", feedbackId);
    if (error) return NextResponse.json({ text: `반려 실패: ${error.message}`, response_type: "ephemeral" });
    await updateSlackMessage({ ts: messageTs, status: "rejected", title: item.title });
    return NextResponse.json({ text: `후기 반려: ${item.title}`, response_type: "ephemeral" });
  }

  if (action.action_id === "community_approve") {
    const postId = action.value;
    if (!postId) return NextResponse.json({ text: "ID 누락", response_type: "ephemeral" });
    const supabase = createAdminClient();
    const { data: item } = await supabase.from("community_posts").select("id,title").eq("id", postId).single();
    if (!item) return NextResponse.json({ text: "항목 없음", response_type: "ephemeral" });
    const { error } = await supabase.from("community_posts").update({ status: "approved" }).eq("id", postId);
    if (error) return NextResponse.json({ text: `승인 실패: ${error.message}`, response_type: "ephemeral" });
    await updateSlackMessage({ ts: messageTs, status: "approved", title: item.title });
    return NextResponse.json({ text: `커뮤니티 글 승인: ${item.title}`, response_type: "ephemeral" });
  }

  if (action.action_id === "community_reject") {
    const postId = action.value;
    if (!postId) return NextResponse.json({ text: "ID 누락", response_type: "ephemeral" });
    const supabase = createAdminClient();
    const { data: item } = await supabase.from("community_posts").select("id,title").eq("id", postId).single();
    if (!item) return NextResponse.json({ text: "항목 없음", response_type: "ephemeral" });
    const { error } = await supabase.from("community_posts").update({ status: "rejected" }).eq("id", postId);
    if (error) return NextResponse.json({ text: `반려 실패: ${error.message}`, response_type: "ephemeral" });
    await updateSlackMessage({ ts: messageTs, status: "rejected", title: item.title });
    return NextResponse.json({ text: `커뮤니티 글 반려: ${item.title}`, response_type: "ephemeral" });
  }

  return NextResponse.json({ text: "알 수 없는 액션입니다.", response_type: "ephemeral" });
}
