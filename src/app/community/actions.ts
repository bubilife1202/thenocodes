"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const communityPostSchema = z
  .object({
    post_type: z.enum(["used_it", "found_it", "question"]),
    title: z.string().trim().min(3).max(120),
    body: z.string().trim().min(10).max(2000),
    link_url: z.string().trim().url().optional().or(z.literal("")),
    author_name: z.string().trim().max(40).optional(),
    website: z.string().trim().optional(),
  })
  .refine(
    (data) => data.post_type !== "found_it" || (data.link_url && data.link_url.length > 0),
    { message: "발견했어요 글에는 링크가 필요합니다", path: ["link_url"] },
  );

const POST_TYPE_LABEL: Record<string, string> = {
  used_it: "써봤어요",
  found_it: "발견했어요",
  question: "질문있어요",
};

async function notifyCommunitySlack(params: {
  title: string;
  body: string;
  postType: string;
  author: string | null;
  postId: string;
}) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  const preview = params.body.length > 120 ? params.body.slice(0, 120) + "…" : params.body;
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*새 커뮤니티 글* · ${POST_TYPE_LABEL[params.postType] ?? params.postType}\n*${params.title}*\n${preview}\n_${params.author || "익명"}_`,
      },
    },
    {
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "승인" }, style: "primary", action_id: "community_approve", value: params.postId },
        { type: "button", text: { type: "plain_text", text: "반려" }, style: "danger", action_id: "community_reject", value: params.postId },
      ],
    },
  ];

  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "C0AS5JSTU4R", text: `새 커뮤니티 글: ${params.title}`, blocks }),
    });
  } catch {
    /* ignore */
  }
}

export async function submitCommunityPost(formData: FormData) {
  const parsed = communityPostSchema.safeParse({
    post_type: formData.get("post_type"),
    title: formData.get("title"),
    body: formData.get("body"),
    link_url: formData.get("link_url") || undefined,
    author_name: formData.get("author_name") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    redirect("/community/new?status=error");
  }

  const values = parsed.data;
  if (values.website) {
    redirect("/community?status=ok");
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from("community_posts")
    .insert({
      post_type: values.post_type,
      title: values.title,
      body: values.body,
      link_url: values.link_url || null,
      author_name: values.author_name || null,
      status: "approved",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to submit community post:", error?.message);
    redirect("/community/new?status=error");
  }

  await notifyCommunitySlack({
    title: values.title,
    body: values.body,
    postType: values.post_type,
    author: values.author_name || null,
    postId: inserted.id,
  });

  revalidatePath("/community");
  redirect("/community?status=ok");
}
