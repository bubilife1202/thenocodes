"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SIGNAL_TYPE_VALUES } from "@/lib/signals/constants";
import {
  createSignalsAdminSession,
  isSignalsAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/signals/admin";
import { createSignalSlug } from "@/lib/signals/slug";
import { createAdminClient } from "@/lib/supabase/admin";

type PasswordActionState = {
  message: string;
};

type SignalActionState = {
  message: string;
  fieldErrors?: Partial<Record<keyof SignalFormValues, string[]>>;
};

type SignalFormValues = {
  title: string;
  slug: string;
  summary: string;
  action_point: string;
  source_url: string;
  source_name: string;
  signal_type: (typeof SIGNAL_TYPE_VALUES)[number];
  tags: string;
  published_at: string;
  is_featured: boolean;
};

const passwordSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

const signalSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().min(20, "요약은 2~3문장으로 작성해 주세요."),
  action_point: z.string().trim().min(10, "바로 실행할 액션을 적어 주세요."),
  source_url: z.url("올바른 출처 URL을 입력해 주세요."),
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
});

export const initialPasswordState: PasswordActionState = {
  message: "",
};

export const initialSignalState: SignalActionState = {
  message: "",
};

export async function unlockSignalsAdmin(
  _prevState: PasswordActionState,
  formData: FormData
): Promise<PasswordActionState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      message: parsed.error.flatten().fieldErrors.password?.[0] ?? "비밀번호를 확인해 주세요.",
    };
  }

  const isValid = await verifyAdminPassword(parsed.data.password);

  if (!isValid) {
    return {
      message: "비밀번호가 맞지 않습니다.",
    };
  }

  await createSignalsAdminSession();
  redirect("/signals/new");
}

export async function createSignal(
  _prevState: SignalActionState,
  formData: FormData
): Promise<SignalActionState> {
  const isAuthorized = await isSignalsAdminAuthenticated();

  if (!isAuthorized) {
    return {
      message: "관리자 인증이 만료되었습니다. 비밀번호를 다시 입력해 주세요.",
    };
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
      message: "슬러그를 만들 수 없습니다. 제목 또는 슬러그를 수정해 주세요.",
      fieldErrors: {
        slug: ["슬러그를 만들 수 없습니다. 제목 또는 슬러그를 수정해 주세요."],
      },
    };
  }

  const tags = values.tags
    ? values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
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
        fieldErrors: {
          slug: ["같은 슬러그가 이미 있습니다."],
        },
      };
    }

    console.error("Failed to create builder signal:", error.message);

    return {
      message: "저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  revalidatePath("/");
  revalidatePath("/signals");
  revalidatePath("/signals/new");
  redirect("/signals");
}
