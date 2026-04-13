"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getChallengeById } from "@/lib/data/challenge-board";

const COMMUNITY_CHANNEL = "C0AS5JSTU4R";

async function notifyCommunitySlack(params: {
  entryType: string;
  toolTitle: string;
  toolId: string;
  body: string;
  submitterName: string | null;
  feedbackId?: string;
}) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  const typeLabels: Record<string, string> = {
    reference: "레퍼런스",
    comment: "코멘트",
    "experiment-log": "실험 로그",
    "challenge-entry": "챌린지 참여",
  };

  const label = typeLabels[params.entryType] ?? params.entryType;
  const preview = params.body.length > 100 ? params.body.slice(0, 100) + "…" : params.body;

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*새 ${label}*  ·  ${params.toolTitle}\n${preview}\n_${params.submitterName || "익명"}_`,
      },
    },
    ...(params.feedbackId
      ? [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "승인" },
                style: "primary",
                action_id: "community_approve",
                value: params.feedbackId,
              },
              {
                type: "button",
                text: { type: "plain_text", text: "반려" },
                style: "danger",
                action_id: "community_reject",
                value: params.feedbackId,
              },
              {
                type: "button",
                text: { type: "plain_text", text: "보드 보기" },
                url: `https://thenocodes.org/challenges/${params.toolId}`,
              },
            ],
          },
        ]
      : []),
  ];

  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: COMMUNITY_CHANNEL,
        text: `새 ${label}: ${params.toolTitle} — ${params.submitterName || "익명"}`,
        blocks,
      }),
    });
  } catch {
    // 슬랙 알림 실패해도 제출 자체는 성공 처리
  }
}

const referenceSchema = z.object({
  tool_id: z.string().trim().min(1),
  title: z.string().trim().min(3).max(120),
  url: z.string().trim().url(),
  note: z.string().trim().max(500).optional(),
  submitted_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

const commentSchema = z.object({
  tool_id: z.string().trim().min(1),
  body: z.string().trim().min(3).max(500),
  submitted_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

function getSafePath(toolId: string) {
  return `/challenges/${toolId}`;
}

export async function submitChallengeReference(formData: FormData) {
  const parsed = referenceSchema.safeParse({
    tool_id: formData.get("tool_id"),
    title: formData.get("title"),
    url: formData.get("url"),
    note: formData.get("note"),
    submitted_name: formData.get("submitted_name"),
    website: formData.get("website"),
  });

  const fallbackToolId = String(formData.get("tool_id") || "");
  if (!parsed.success) {
    redirect(`${getSafePath(fallbackToolId)}?status=reference-error`);
  }

  const values = parsed.data;
  if (values.website) {
    redirect(`${getSafePath(values.tool_id)}?status=reference-ok`);
  }

  const tool = getChallengeById(values.tool_id);
  if (!tool) {
    redirect("/challenges?status=invalid-tool");
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase.from("feedback_items").insert({
    title: values.title,
    body: values.note || `${tool.title} 레퍼런스`,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "community",
    submitter_name: values.submitted_name || null,
    related_url: values.url,
    is_public: false,
    tags: ["challenge-board", `challenge:${values.tool_id}`, "entry:reference"],
  }).select("id").single();

  if (error) {
    console.error("Failed to submit challenge reference:", error.message);
    redirect(`${getSafePath(values.tool_id)}?status=reference-error`);
  }

  await notifyCommunitySlack({
    entryType: "reference",
    toolTitle: tool?.title ?? values.tool_id,
    toolId: values.tool_id,
    body: `${values.title}\n${values.url}`,
    submitterName: values.submitted_name || null,
    feedbackId: inserted?.id,
  });

  revalidatePath("/challenges");
  revalidatePath(getSafePath(values.tool_id));
  redirect(`${getSafePath(values.tool_id)}?status=reference-ok`);
}

const experimentLogSchema = z.object({
  tool_id: z.string().trim().min(1),
  result: z.string().trim().min(3).max(200),
  takeaway: z.string().trim().min(3).max(200),
  time_spent: z.enum(["5분", "15분", "30분", "1시간+"]),
  scenario: z.string().trim().max(100).optional(),
  submitted_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

export async function submitExperimentLog(formData: FormData) {
  const parsed = experimentLogSchema.safeParse({
    tool_id: formData.get("tool_id"),
    result: formData.get("result"),
    takeaway: formData.get("takeaway"),
    time_spent: formData.get("time_spent"),
    scenario: formData.get("scenario") || undefined,
    submitted_name: formData.get("submitted_name") || undefined,
    website: formData.get("website") || undefined,
  });

  const fallbackToolId = String(formData.get("tool_id") || "");
  if (!parsed.success) {
    redirect(`${getSafePath(fallbackToolId)}?status=log-error`);
  }

  const values = parsed.data;
  if (values.website) {
    redirect(`${getSafePath(values.tool_id)}?status=log-ok`);
  }

  const tool = getChallengeById(values.tool_id);
  if (!tool) {
    redirect("/challenges?status=invalid-tool");
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase.from("feedback_items").insert({
    title: `${tool.title} 실험 로그`,
    body: `${values.result}\n${values.takeaway}`,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "community",
    submitter_name: values.submitted_name || null,
    is_public: false,
    tags: [
      "challenge-board",
      `challenge:${values.tool_id}`,
      "entry:experiment-log",
      `time-spent:${values.time_spent}`,
      ...(values.scenario ? [`scenario:${values.scenario}`] : []),
    ],
  }).select("id").single();

  if (error) {
    console.error("Failed to submit experiment log:", error.message);
    redirect(`${getSafePath(values.tool_id)}?status=log-error`);
  }

  await notifyCommunitySlack({
    entryType: "experiment-log",
    toolTitle: tool.title,
    toolId: values.tool_id,
    body: `${values.result}\n${values.takeaway}`,
    submitterName: values.submitted_name || null,
    feedbackId: inserted?.id,
  });

  revalidatePath("/challenges");
  revalidatePath(getSafePath(values.tool_id));
  redirect(`${getSafePath(values.tool_id)}?status=log-ok`);
}

const challengeEntrySchema = z.object({
  week_tag: z.string().trim().min(1),
  tool_id: z.string().trim().min(1),
  result: z.string().trim().min(3).max(200),
  takeaway: z.string().trim().min(3).max(200),
  time_spent: z.enum(["5분", "15분", "30분", "1시간+"]),
  submitted_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

export async function submitWeeklyChallengeEntry(formData: FormData) {
  const parsed = challengeEntrySchema.safeParse({
    week_tag: formData.get("week_tag"),
    tool_id: formData.get("tool_id"),
    result: formData.get("result"),
    takeaway: formData.get("takeaway"),
    time_spent: formData.get("time_spent"),
    submitted_name: formData.get("submitted_name") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    redirect("/challenges/weekly?status=entry-error");
  }

  const values = parsed.data;
  if (values.website) {
    redirect("/challenges/weekly?status=entry-ok");
  }

  const { weekTag, toolId } = { weekTag: values.week_tag, toolId: values.tool_id };

  const supabase = createAdminClient();
  const { data: existing, error: fetchError } = await supabase
    .from("feedback_items")
    .select("id")
    .contains("tags", ["challenge-board", "entry:weekly-challenge", `week:${weekTag}`])
    .limit(1)
    .single();

  if (fetchError || !existing) {
    redirect("/challenges/weekly?status=entry-error");
  }

  const { data: inserted, error } = await supabase.from("feedback_items").insert({
    title: `위클리 챌린지 참여 (${weekTag})`,
    body: `${values.result}\n${values.takeaway}`,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "community",
    submitter_name: values.submitted_name || null,
    is_public: false,
    tags: [
      "challenge-board",
      `challenge:${toolId}`,
      "entry:challenge-entry",
      `week:${weekTag}`,
      `time-spent:${values.time_spent}`,
    ],
  }).select("id").single();

  if (error) {
    console.error("Failed to submit weekly challenge entry:", error.message);
    redirect("/challenges/weekly?status=entry-error");
  }

  const tool = getChallengeById(toolId);
  await notifyCommunitySlack({
    entryType: "challenge-entry",
    toolTitle: tool?.title ?? toolId,
    toolId,
    body: `${values.result}\n${values.takeaway}`,
    submitterName: values.submitted_name || null,
    feedbackId: inserted?.id,
  });

  revalidatePath("/challenges");
  revalidatePath(getSafePath(toolId));
  revalidatePath("/challenges/weekly");
  redirect("/challenges/weekly?status=entry-ok");
}

export async function submitChallengeComment(formData: FormData) {
  const parsed = commentSchema.safeParse({
    tool_id: formData.get("tool_id"),
    body: formData.get("body"),
    submitted_name: formData.get("submitted_name"),
    website: formData.get("website"),
  });

  const fallbackToolId = String(formData.get("tool_id") || "");
  if (!parsed.success) {
    redirect(`${getSafePath(fallbackToolId)}?status=comment-error`);
  }

  const values = parsed.data;
  if (values.website) {
    redirect(`${getSafePath(values.tool_id)}?status=comment-ok`);
  }

  const tool = getChallengeById(values.tool_id);
  if (!tool) {
    redirect("/challenges?status=invalid-tool");
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase.from("feedback_items").insert({
    title: `${tool.title} 코멘트`,
    body: values.body,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "community",
    submitter_name: values.submitted_name || null,
    is_public: false,
    tags: ["challenge-board", `challenge:${values.tool_id}`, "entry:comment"],
  }).select("id").single();

  if (error) {
    console.error("Failed to submit challenge comment:", error.message);
    redirect(`${getSafePath(values.tool_id)}?status=comment-error`);
  }

  await notifyCommunitySlack({
    entryType: "comment",
    toolTitle: tool?.title ?? values.tool_id,
    toolId: values.tool_id,
    body: values.body,
    submitterName: values.submitted_name || null,
    feedbackId: inserted?.id,
  });

  revalidatePath("/challenges");
  revalidatePath(getSafePath(values.tool_id));
  redirect(`${getSafePath(values.tool_id)}?status=comment-ok`);
}
