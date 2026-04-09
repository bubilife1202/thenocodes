"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { SIGNAL_TYPE_VALUES } from "@/lib/signals/constants";
import { createSignalSlug } from "@/lib/signals/slug";

type ReviewActionState = {
  message: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

const reviewSchema = z.object({
  pending_id: z.string().uuid("대기열 항목이 올바르지 않습니다."),
  intent: z.enum(["approve", "reject"]),
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(10, "요약을 작성해 주세요."),
  action_point: z.string().trim().min(10, "액션 포인트를 작성해 주세요."),
  source_url: z.string().url("올바른 URL을 입력해 주세요."),
  source_name: z.string().trim().optional(),
  signal_type: z.enum(SIGNAL_TYPE_VALUES),
  tags: z.string().trim().optional(),
  moderation_note: z.string().trim().optional(),
});

export const initialReviewState: ReviewActionState = {
  message: "",
};

async function postSlackReply(text: string, threadTs?: string | null) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || !threadTs) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: "C0AS5JSTU4R",
      thread_ts: threadTs,
      text,
    }),
  });
}

export async function reviewPendingSignal(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const token = (await cookies()).get("signals-admin")?.value;
  if (token !== "authenticated") {
    return { message: "관리자 인증이 필요합니다." };
  }

  const parsed = reviewSchema.safeParse({
    pending_id: formData.get("pending_id"),
    intent: formData.get("intent"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    action_point: formData.get("action_point"),
    source_url: formData.get("source_url"),
    source_name: formData.get("source_name"),
    signal_type: formData.get("signal_type"),
    tags: formData.get("tags"),
    moderation_note: formData.get("moderation_note"),
  });

  if (!parsed.success) {
    return {
      message: "입력값을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;
  const supabase = createAdminClient();
  const { data: pending, error: pendingError } = await supabase
    .from("pending_signals")
    .select("id,status,slack_ts,url")
    .eq("id", values.pending_id)
    .maybeSingle();

  if (pendingError || !pending) {
    return { message: "대기열 항목을 찾지 못했습니다." };
  }

  if (pending.status !== "pending") {
    return { message: "이미 처리된 항목입니다." };
  }

  if (values.intent === "reject") {
    const reason = values.moderation_note || "흐름 기준과 맞지 않아 보류했습니다.";
    const { error } = await supabase
      .from("pending_signals")
      .update({ status: "rejected", reject_reason: reason })
      .eq("id", values.pending_id);

    if (error) {
      return { message: `반려 처리 중 오류가 발생했습니다: ${error.message}` };
    }

    await postSlackReply(`❌ 흐름 반영 보류\n• ${values.title}\n• 사유: ${reason}`, pending.slack_ts);

    revalidatePath("/signals/pending");
    redirect("/signals/pending?status=rejected");
  }

  const slug = createSignalSlug(values.slug || values.title);
  if (!slug) {
    return {
      message: "슬러그를 만들 수 없습니다.",
      fieldErrors: { slug: ["슬러그를 만들 수 없습니다."] },
    };
  }

  const tags = values.tags
    ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const { error: insertError } = await supabase.from("builder_signals").insert({
    title: values.title,
    slug,
    summary: values.summary,
    action_point: values.action_point,
    source_url: values.source_url,
    source_name: values.source_name || null,
    signal_type: values.signal_type,
    tags,
    published_at: new Date().toISOString(),
    is_featured: true,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        message: "같은 슬러그가 이미 있습니다.",
        fieldErrors: { slug: ["같은 슬러그가 이미 있습니다."] },
      };
    }
    return { message: `공개 등록 중 오류가 발생했습니다: ${insertError.message}` };
  }

  const { error: approveError } = await supabase
    .from("pending_signals")
    .update({ status: "approved", reject_reason: null })
    .eq("id", values.pending_id);

  if (approveError) {
    return { message: `대기열 승인 처리 중 오류가 발생했습니다: ${approveError.message}` };
  }

  await postSlackReply(
    `✅ 흐름 등록 완료\n• ${values.title}\n• ${values.source_url}\n• https://thenocodes.org/signals`,
    pending.slack_ts
  );

  revalidatePath("/");
  revalidatePath("/signals");
  revalidatePath("/signals/pending");
  redirect("/signals/pending?status=approved");
}
