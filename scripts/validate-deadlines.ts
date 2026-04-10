/**
 * 기존 hackathons 테이블의 모든 이벤트를 다시 검증해서 신청 마감일을 갱신.
 *
 * 동작:
 * 1. 진행중/예정 상태의 모든 이벤트 조회
 * 2. URL fetch → "참가신청기간", "접수기간", "모집기간" 텍스트에서 마감일 추출
 * 3. 마감 키워드(신청 마감, 접수 마감 등) 발견되면 ends_at을 어제로 설정 (ended 처리)
 * 4. 추출한 신청 마감일로 ends_at 업데이트
 *
 * 사용법: export $(grep -v '^#' thenocodes-secrets/env.local | xargs) && npx tsx scripts/validate-deadlines.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CLOSED_KEYWORDS = [
  "신청 마감되었습니다",
  "신청이 마감",
  "접수 마감되었습니다",
  "접수가 마감",
  "모집 마감",
  "모집 종료",
  "Application closed",
  "Registration closed",
  "Event ended",
  "Submissions closed",
];

// 신청 기간 패턴
const PERIOD_PATTERNS = [
  // "참가신청기간: 2026-04-01 ~ 2026-04-30"
  /참가\s*신청\s*기간\s*[:：]?\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*[~∼\-–—]\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/,
  // "접수기간: 2026.04.01 - 2026.04.30"
  /접수\s*기간\s*[:：]?\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*[~∼\-–—]\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/,
  // "모집기간"
  /모집\s*기간\s*[:：]?\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*[~∼\-–—]\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/,
  // "신청기간"
  /신청\s*기간\s*[:：]?\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*[~∼\-–—]\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/,
  // "Application Period: ... - YYYY-MM-DD"
  /Application\s+Period\s*[:：]?\s*\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\s*[~∼\-–—]\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/i,
];

function parseKoreanDate(s: string): Date | null {
  const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 14, 59, 59)); // 23:59 KST
  return isNaN(date.getTime()) ? null : date;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

interface ValidationResult {
  closed: boolean;
  closedKeyword?: string;
  applicationDeadline?: Date;
  patternMatched?: string;
}

export async function validateUrl(url: string): Promise<ValidationResult> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) return { closed: false };
    const html = await res.text();
    const text = stripHtml(html);

    // 1. 마감 키워드 체크
    for (const keyword of CLOSED_KEYWORDS) {
      if (text.includes(keyword)) {
        return { closed: true, closedKeyword: keyword };
      }
    }

    // 2. 신청 기간 패턴 추출
    for (const pattern of PERIOD_PATTERNS) {
      const m = text.match(pattern);
      if (m) {
        const deadline = parseKoreanDate(m[1]);
        if (deadline) {
          return {
            closed: deadline < new Date(),
            applicationDeadline: deadline,
            patternMatched: m[0],
          };
        }
      }
    }

    return { closed: false };
  } catch {
    return { closed: false };
  }
}

async function main() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("hackathons")
    .select("id, title, url, ends_at, category")
    .or(`ends_at.gte.${now},ends_at.is.null`)
    .limit(500);

  if (error) {
    console.error("Failed to fetch:", error.message);
    process.exit(1);
  }

  console.log(`검증 대상: ${data?.length ?? 0}개\n`);

  let closedCount = 0;
  let updatedCount = 0;
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  for (const item of data ?? []) {
    const result = await validateUrl(item.url);

    if (result.closed) {
      closedCount++;
      const reason = result.closedKeyword
        ? `키워드 [${result.closedKeyword}]`
        : `신청기간 만료 (${result.applicationDeadline?.toISOString().slice(0, 10)})`;
      console.log(`❌ [${item.category}] ${item.title.slice(0, 50)} — ${reason}`);

      // ends_at을 어제로 설정해서 ended 처리
      await supabase.from("hackathons").update({ ends_at: yesterday }).eq("id", item.id);
    } else if (result.applicationDeadline) {
      const newEndsAt = result.applicationDeadline.toISOString();
      if (newEndsAt !== item.ends_at) {
        updatedCount++;
        console.log(`📅 [${item.category}] ${item.title.slice(0, 50)} — ${result.applicationDeadline.toISOString().slice(0, 10)}`);
        await supabase.from("hackathons").update({ ends_at: newEndsAt }).eq("id", item.id);
      }
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`마감 처리: ${closedCount}개`);
  console.log(`마감일 갱신: ${updatedCount}개`);
}

main().catch(console.error);
