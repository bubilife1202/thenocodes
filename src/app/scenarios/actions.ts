"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const waitlistSchema = z.object({
  email: z.string().trim().email().max(320),
  consent_marketing: z
    .preprocess((v) => v === "on" || v === "true" || v === true, z.boolean())
    .optional(),
  website: z.string().trim().optional(), // honey-pot
});

export async function submitWaitlist(formData: FormData) {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    consent_marketing: formData.get("consent_marketing"),
    website: formData.get("website") || undefined,
  });

  if (!parsed.success) {
    redirect("/scenarios?waitlist=invalid#waitlist");
  }

  const values = parsed.data;
  if (values.website) {
    // honey-pot triggered; pretend-success to not leak bot detection
    redirect("/scenarios?waitlist=ok#waitlist");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("waitlist_leads").insert({
    email: values.email.toLowerCase(),
    consent_marketing: values.consent_marketing ?? false,
    source: "scenarios_page",
  });

  if (error && !error.message.includes("duplicate")) {
    console.error("Failed to insert waitlist_leads:", error.message);
    redirect("/scenarios?waitlist=error#waitlist");
  }

  redirect("/scenarios?waitlist=ok#waitlist");
}
