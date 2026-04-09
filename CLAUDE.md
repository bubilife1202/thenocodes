@AGENTS.md

# 흐름(Signal) 추가 워크플로우

## 절대 원칙
- 슬랙 `#흐름-링크`에 올라온 링크를 **builder_signals에 바로 공개 등록하지 않는다**.
- 먼저 **원문 확인 → 공식 출처 확인 → 더노코즈 톤으로 정제**를 거친다.
- 2차 기사나 커뮤니티 글을 받았더라도, 가능하면 **공식 블로그 / 공식 문서 / 공식 저장소**로 source_url을 교체한다.
- 제목, 요약, 액션 포인트에 **원문 URL을 그대로 복붙하지 않는다**.

## 1단계: 링크를 대기열에 넣기
- 슬랙 웹훅은 링크를 받으면 `pending_signals`에 넣는다.
- 자동으로 공개하지 않는다.
- 슬랙 스레드에는 임시 초안과 함께 아래 버튼을 띄운다:
  - 승인
  - 수정 요청
  - 반려
  - 원문 확인
- 슬랙 Interactivity Request URL은 `/api/slack/interactions` 로 연결한다.
- 슬랙 답변의 의미는 아래와 같다:
  - 대기열 등록
  - 이미 공개됨
  - 이미 검토 대기중
  - 기준 미달로 보류

## 2단계: 원문 확인
- WebFetch로 링크 내용을 읽는다.
- 원본 소스(공식 블로그, 릴리즈 노트, GitHub, HuggingFace, 공식 문서)를 찾는다.
- 2차 기사만 있을 경우, 가능하면 공식 원문을 source_url로 사용한다.

## 3단계: 진입 기준 판정
아래 기준으로 "흐름"에 넣을지 판단한다.

### 넣는다 (O)
- API/SDK 공개 (바로 쓸 수 있음)
- 오픈소스 모델 가중치 공개
- 빌더 도구/플랫폼 대규모 업데이트
- 한국 AI 정책/규제 변화
- 워크플로우를 실제로 바꾸는 기능 추가
- **핵심 질문: "이걸로 빌더가 만드는 방식이 바뀌는가?"**

### 안 넣는다 (X)
- 투자/인수 가십
- 밈/커뮤니티 잡담
- 루머
- 추상적 비전 발표 ("10년 로드맵")
- B2C 앱 출시 (API 없음)
- 마이너 패치/버그픽스
- 벤치마크 자랑만 있고 실제 사용 맥락이 약한 글

## 4단계: 정제해서 시그널 데이터 만들기
판정이 O이면 아래 필드를 **직접 정제해서** 채운다.

- `title`: 한국어 제목, 짧고 명확하게
- `summary`: 2~3문장 요약, "그래서 뭐가 달라졌는지" 중심
- `action_point`: "빌더가 당장 해볼 것"을 구체적으로
- `source_url`: 가능하면 공식 원문 링크
- `source_name`: 공식 발행자명 (예: Anthropic, OpenAI, Z.ai, LG AI Research)
- `signal_type`: `platform_launch | api_tool | open_model | policy`
- `tags`: 3~5개 이내
- `published_at`: 실제 발표일

### 작성 규칙
- 제목에 URL 그대로 넣지 않는다.
- summary에 메타 description을 그대로 복붙하지 않는다.
- action_point를 `원본 문서를 확인하고 바로 써보세요`처럼 상투적으로 쓰지 않는다.
- 벤치마크 수치보다 **실무 활용 포인트**를 앞에 둔다.
- 기사체 문장을 옮기기보다, 더노코즈 톤으로 **재작성**한다.

## 5단계: 공개 등록
정제가 끝난 뒤에만 `builder_signals`에 넣는다.

```bash
source thenocodes-secrets/env.local && echo '<JSON>' | npx tsx scripts/add-signal.ts
```

## 6단계: 대기열 상태 업데이트 + 슬랙 알림
승인 시:
- 슬랙 버튼에서 바로 승인할 수 있다.
- `pending_signals.status = approved`
- `builder_signals`에 공개 등록
- 슬랙 스레드에 등록 완료 알림

반려 시:
- 슬랙 버튼에서 바로 반려할 수 있다.
- `pending_signals.status = rejected`
- `reject_reason` 기록
- 슬랙 스레드에 반려 이유 알림

수정 요청 시:
- 슬랙 버튼으로 검토 페이지를 연다.
- 검토 페이지에서 제목/요약/액션 포인트를 수정한 뒤 승인한다.

## signal_type 분류 기준
- `platform_launch`: 새 플랫폼, managed service, 인프라
- `api_tool`: 새 API, SDK, 개발자 도구
- `open_model`: 오픈소스 모델 공개
- `policy`: 한국 AI 정책, 규제, 지원사업 변화

# 슬랙 대기열 처리 워크플로우

유저가 "슬랙 링크 처리해" 또는 "pending 확인해"라고 하면 아래 프로세스를 실행한다.

## 1단계: 대기열 조회
```bash
export $(grep -v '^#' thenocodes-secrets/env.local | xargs) && npx tsx -e '
import { createClient } from "@supabase/supabase-js";
async function run() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from("pending_signals").select("*").eq("status", "pending").order("created_at", { ascending: true });
  console.log(JSON.stringify(data, null, 2));
}
run();
'
```

## 2단계: 각 URL을 검토하고 정제
- WebFetch로 내용 읽기
- 공식 원문 찾기
- O/X 판정
- O이면 정제한 JSON을 만들어 `scripts/add-signal.ts`로 등록
- X이면 반려 이유 작성

## 3단계: 대기열 상태 업데이트 + 슬랙 알림
```bash
# 승인 시
export $(grep -v '^#' thenocodes-secrets/env.local | xargs) && npx tsx -e '
import { createClient } from "@supabase/supabase-js";
async function run() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await s.from("pending_signals").update({ status: "approved" }).eq("id", "PENDING_ID");
}
run();
'

# 반려 시
export $(grep -v '^#' thenocodes-secrets/env.local | xargs) && npx tsx -e '
import { createClient } from "@supabase/supabase-js";
async function run() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await s.from("pending_signals").update({ status: "rejected", reject_reason: "REASON" }).eq("id", "PENDING_ID");
}
run();
'
```

## 슬랙 환경변수
- `SLACK_BOT_TOKEN`: Cloudflare Workers secret에 설정됨
- 채널 ID: `C0AS5JSTU4R` (`#흐름-링크`)
