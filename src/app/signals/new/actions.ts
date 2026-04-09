"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SIGNAL_TYPE_VALUES } from "@/lib/signals/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSignalSlug } from "@/lib/signals/slug";

type SignalActionState = {
  message: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

const signalSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(10, "요약을 작성해 주세요."),
  action_point: z.string().trim().min(10, "액션 포인트를 작성해 주세요."),
  source_url: z.string().url("올바른 URL을 입력해 주세요."),
  source_name: z.string().trim().optional(),
  signal_type: z.enum(SIGNAL_TYPE_VALUES, {
    error: "흐름 유형을 선택해 주세요.",
  }),
  tags: z.string().trim().optional(),
  published_at: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "발행일을 선택해 주세요."),
  is_featured: z.boolean(),
  admin_key: z.string().min(1),
});

export const initialSignalState: SignalActionState = {
  message: "",
};

export async function createSignal(
  _prevState: SignalActionState,
  formData: FormData
): Promise<SignalActionState> {
  const adminPassword = process.env.ADMIN_PASSWORD || "thenocodes2026";
  const adminKey = formData.get("admin_key") as string;

  if (adminKey !== adminPassword) {
    return { message: "관리자 인증이 만료되었습니다. 다시 접속해 주세요." };
  }

  const parsed = signalSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    action_point: formData.get("action_point"),
    source_url: formData.get("source_url"),
    source_name: formData.get("source_name"),
    signal_type: formData.get("signal_type"),
    tags: formData.get("tags"),
    published_at: formData.get("published_at"),
    is_featured: formData.get("is_featured") === "on",
    admin_key: adminKey,
  });

  if (!parsed.success) {
    return {
      message: "입력값을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;
  const slug = createSignalSlug(values.slug || values.title);

  if (!slug) {
    return {
      message: "슬러그를 만들 수 없습니다.",
      fieldErrors: { slug: ["슬러그를 만들 수 없습니다."] },
    };
  }

  const tags = values.tags
    ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const supabase = createAdminClient();
  const { error } = await supabase.from("builder_signals").insert({
    title: values.title,
    slug,
    summary: values.summary,
    action_point: values.action_point,
    source_url: values.source_url,
    source_name: values.source_name || null,
    signal_type: values.signal_type,
    tags,
    published_at: `${values.published_at}T00:00:00+09:00`,
    is_featured: values.is_featured,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        message: "같은 슬러그가 이미 있습니다.",
        fieldErrors: { slug: ["같은 슬러그가 이미 있습니다."] },
      };
    }
    console.error("Failed to create signal:", error.message);
    return { message: "저장 중 오류가 발생했습니다." };
  }

  revalidatePath("/");
  revalidatePath("/signals");
  redirect("/signals");
}
