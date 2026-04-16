"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const commentSchema = z.object({
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  body: z.string().trim().min(2).max(1000),
  author_name: z.string().trim().max(40).optional(),
  website: z.string().trim().optional(),
});

export async function submitComment(formData: FormData) {
  const parsed = commentSchema.safeParse({
    post_id: formData.get("post_id"),
    parent_id: formData.get("parent_id") || undefined,
    body: formData.get("body"),
    author_name: formData.get("author_name") || undefined,
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    redirect(`/community/${formData.get("post_id")}?comment=error`);
  }

  const values = parsed.data;
  if (values.website) {
    redirect(`/community/${values.post_id}`);
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("community_comments").insert({
    post_id: values.post_id,
    parent_id: values.parent_id || null,
    body: values.body,
    author_name: values.author_name || null,
    source: "web",
  });

  if (error) {
    console.error("Failed to submit comment:", error.message);
    redirect(`/community/${values.post_id}?comment=error`);
  }

  revalidatePath(`/community/${values.post_id}`);
  revalidatePath("/community");
  redirect(`/community/${values.post_id}?comment=ok`);
}
