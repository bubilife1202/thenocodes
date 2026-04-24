"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInfographicSlug } from "@/lib/infographics/slug";
import { isSafeInfographicImageUrl } from "@/lib/infographics/url";

export type InfographicActionState = {
  message: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const RATE_LIMIT_MAX_BUCKETS = 1000;
const rateLimitStore = new Map<string, RateLimitBucket>();

async function getClientKey() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const cloudflareIp = headerStore.get("cf-connecting-ip");

  if (headerStore.get("cf-ray") && cloudflareIp) return cloudflareIp;

  return headerStore.get("x-real-ip") || forwardedFor || "unknown";
}

function cleanupRateLimitStore(now: number) {
  for (const [key, bucket] of rateLimitStore) {
    if (bucket.resetAt <= now) rateLimitStore.delete(key);
  }

  while (rateLimitStore.size > RATE_LIMIT_MAX_BUCKETS) {
    const oldestKey = rateLimitStore.keys().next().value;
    if (!oldestKey) break;
    rateLimitStore.delete(oldestKey);
  }
}

function checkRateLimit(clientKey: string) {
  const now = Date.now();
  cleanupRateLimitStore(now);

  const bucket = rateLimitStore.get(clientKey);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX_SUBMISSIONS) return false;

  bucket.count += 1;
  return true;
}

const originalUrl = z.string().trim().url("원문 출처 링크를 입력해 주세요.").refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "http:" || protocol === "https:";
}, "http 또는 https URL만 입력해 주세요.");

const infographicImageUrl = z
  .string()
  .trim()
  .url("인포그래픽 이미지 URL을 입력해 주세요.")
  .refine(
    isSafeInfographicImageUrl,
    "https 이미지 URL(.png, .jpg, .jpeg, .webp, .gif, .avif)만 입력해 주세요.",
  );

const infographicSchema = z.object({
  title: z.string().trim().min(3, "제목을 3자 이상 입력해 주세요.").max(160, "제목은 160자 이하로 입력해 주세요."),
  original_url: originalUrl,
  infographic_url: infographicImageUrl,
  website: z.string().trim().max(200).optional().or(z.literal("")),
});

function inferSourceType(originalUrlValue: string) {
  return new URL(originalUrlValue).hostname.toLowerCase().includes("github.com") ? "github" : "paper";
}

export async function createInfographic(
  _prevState: InfographicActionState,
  formData: FormData,
): Promise<InfographicActionState> {
  const parsed = infographicSchema.safeParse({
    title: formData.get("title"),
    original_url: formData.get("original_url"),
    infographic_url: formData.get("infographic_url"),
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    return {
      message: "입력값을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const values = parsed.data;

  if (values.website) {
    redirect("/infographics?status=created");
  }

  if (!checkRateLimit(await getClientKey())) {
    return { message: "등록 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." };
  }

  const slug = createInfographicSlug(values.title);

  if (!slug) {
    return {
      message: "슬러그를 만들 수 없습니다.",
      fieldErrors: { title: ["제목에 글자/숫자를 포함해 주세요."] },
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("infographics").insert({
    slug,
    source_type: inferSourceType(values.original_url),
    title: values.title,
    original_url: values.original_url,
    infographic_url: values.infographic_url,
    summary: null,
    authors: null,
    repository: null,
    stars: null,
    tags: [],
    published_at: null,
    is_featured: false,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        message: "같은 제목으로 만든 슬러그가 이미 있습니다. 제목을 조금 다르게 입력해 주세요.",
        fieldErrors: { title: ["이미 등록된 제목입니다."] },
      };
    }

    console.error("Failed to create infographic:", error.message);
    return { message: "저장 중 오류가 발생했습니다." };
  }

  revalidatePath("/");
  revalidatePath("/infographics");
  redirect("/infographics?status=created");
}
