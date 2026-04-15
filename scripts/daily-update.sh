#!/bin/bash
# 매일 자동 업데이트: 해커톤 수집 + 마감일 검증 + 만료 삭제
# cron: 0 9 * * * /Users/macmini_cozac/Code/thenocodes.org/scripts/daily-update.sh >> /tmp/thenocodes-daily.log 2>&1

set -e

export PATH="/Users/macmini_cozac/.local/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd /Users/macmini_cozac/Code/thenocodes.org
export $(grep -v '^#' thenocodes-secrets/env.local | xargs)

echo "=== $(date '+%Y-%m-%d %H:%M') 더노코즈 일일 업데이트 ==="

# 1. 해커톤/공모전/밋업 수집 (8개 소스)
echo "[1/4] 해커톤 수집 중..."
npx tsx scripts/collect-hackathons.ts 2>&1 || echo "수집 실패 (계속 진행)"

# 2. 마감일 검증 (URL 접속해서 실제 마감일 확인)
echo "[2/4] 마감일 검증 중..."
npx tsx scripts/validate-deadlines.ts 2>&1 || echo "검증 실패 (계속 진행)"

# 3. 만료 항목 삭제
echo "[3/4] 만료 항목 삭제 중..."
npx tsx -e '
import { createClient } from "@supabase/supabase-js";
async function run() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const now = new Date().toISOString();
  const { count } = await s.from("hackathons").delete({ count: "exact" }).lt("ends_at", now).not("ends_at", "is", null);
  console.log("만료 삭제:", count ?? 0, "건");
}
run();
' 2>&1

# 4. 배포 (ISR이라 필수는 아니지만, 정적 에셋 갱신용)
echo "[4/4] 배포 중..."
npm run deploy 2>&1 | tail -5

echo "=== 완료 ==="
