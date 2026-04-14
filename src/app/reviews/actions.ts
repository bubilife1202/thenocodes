"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const reviewSchema = z.object({
  category: z.enum(["tool", "hackathon", "course", "support", "etc"]),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(2000),
  related_url: z.string().trim().url().optional().or(z.literal("")),
  author_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

async function notifyReviewSlack(params: {
  title: string;
  body: string;
  category: string;
  author: string | null;
  feedbackId: string;
}) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  const preview = params.body.length > 120 ? params.body.slice(0, 120) + "…" : params.body;
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*새 사용 후기* · ${params.category}\n*${params.title}*\n${preview}\n_${params.author || "익명"}_`,
      },
    },
    {
      type: "actions",
      elements: [
        { type: "button", text: { type: "plain_text", text: "승인" }, style: "primary", action_id: "review_approve", value: params.feedbackId },
        { type: "button", text: { type: "plain_text", text: "반려" }, style: "danger", action_id: "review_reject", value: params.feedbackId },
      ],
    },
  ];

  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "C0AS5JSTU4R", text: `새 후기: ${params.title}`, blocks }),
    });
  } catch {
    /* ignore */
  }
}

export async function submitReview(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    body: formData.get("body"),
    related_url: formData.get("related_url") || undefined,
    author_name: formData.get("author_name") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    redirect("/reviews?status=error");
  }

  const values = parsed.data;
  if (values.website) {
    redirect("/reviews?status=ok");
  }

  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase.from("feedback_items").insert({
    title: values.title,
    body: values.body,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "community",
    submitter_name: values.author_name || null,
    related_url: values.related_url || null,
    is_public: false,
    tags: ["review", `category:${values.category}`],
  }).select("id").single();

  if (error || !inserted) {
    console.error("Failed to submit review:", error?.message);
    redirect("/reviews?status=error");
  }

  await notifyReviewSlack({
    title: values.title,
    body: values.body,
    category: values.category,
    author: values.author_name || null,
    feedbackId: inserted.id,
  });

  revalidatePath("/reviews");
  redirect("/reviews?status=ok");
}
