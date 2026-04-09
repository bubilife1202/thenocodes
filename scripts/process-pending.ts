/**
 * 슬랙 대기열 처리 스크립트
 *
 * 사용법: export $(grep -v '^#' thenocodes-secrets/env.local | xargs) && npx tsx scripts/process-pending.ts
 *
 * Claude CLI에서 "슬랙 링크 처리해"라고 하면 이 스크립트 대신
 * CLAUDE.md 워크플로우를 따라 직접 처리해도 됨.
 * 이 스크립트는 대기열 조회 + 상태 업데이트 + 슬랙 알림만 담당.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const slackToken = process.env.SLACK_BOT_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function slackReply(text: string, threadTs?: string) {
  if (!slackToken) return;
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${slackToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: "C0AS5JSTU4R",
      text,
      ...(threadTs ? { thread_ts: threadTs } : {}),
    }),
  });
}

export async function getPending() {
  const { data, error } = await supabase
    .from("pending_signals")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch pending:", error.message);
    return [];
  }
  return data ?? [];
}

export async function approvePending(id: string, signalTitle: string, slackTs?: string) {
  await supabase.from("pending_signals").update({ status: "approved" }).eq("id", id);
  await slackReply(`✅ 등록 완료: ${signalTitle}\n🔗 https://thenocodes.org/signals`, slackTs);
  console.log(`✅ Approved: ${id}`);
}

export async function rejectPending(id: string, reason: string, slackTs?: string) {
  await supabase.from("pending_signals").update({ status: "rejected", reject_reason: reason }).eq("id", id);
  await slackReply(`❌ 기준 미달: ${reason}`, slackTs);
  console.log(`❌ Rejected: ${id} — ${reason}`);
}

// 직접 실행 시 대기열 출력
async function main() {
  const pending = await getPending();

  if (pending.length === 0) {
    console.log("대기열이 비어있습니다.");
    return;
  }

  console.log(`\n📥 대기 중인 링크 ${pending.length}개:\n`);
  for (const item of pending) {
    console.log(`  ID: ${item.id}`);
    console.log(`  URL: ${item.url}`);
    console.log(`  제출: ${item.submitted_by} (${new Date(item.created_at).toLocaleString("ko-KR")})`);
    console.log("");
  }
}

main().catch(console.error);
