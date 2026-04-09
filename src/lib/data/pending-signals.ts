import { createAdminClient } from "@/lib/supabase/admin";

export type PendingSignalRow = {
  id: string;
  url: string;
  submitted_by: string | null;
  slack_channel: string | null;
  slack_ts: string | null;
  status: "pending" | "approved" | "rejected";
  reject_reason: string | null;
  created_at: string;
};

const FIELDS = "id,url,submitted_by,slack_channel,slack_ts,status,reject_reason,created_at" as const;

export async function getPendingSignals() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pending_signals")
    .select(FIELDS)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch pending signals:", error.message);
    return [] as PendingSignalRow[];
  }

  return (data ?? []) as PendingSignalRow[];
}

export async function getPendingSignalById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pending_signals")
    .select(FIELDS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch pending signal ${id}:`, error.message);
    return null;
  }

  return data as PendingSignalRow | null;
}
