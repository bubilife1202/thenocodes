@AGENTS.md

# 흐름(Signal) 추가 워크플로우

유저가 링크를 주면 아래 프로세스를 자동으로 실행한다.

## 1단계: 링크 내용 파악
- WebFetch로 링크 내용을 읽는다
- 원본 소스(공식 블로그, 릴리즈 노트 등)를 찾는다

## 2단계: 진입 기준 판정
아래 기준으로 "흐름"에 넣을지 판단한다:

### 넣는다 (O)
- API/SDK 공개 (바로 쓸 수 있음)
- 오픈소스 모델 가중치 공개
- 빌더 도구/플랫폼 대규모 업데이트
- 한국 AI 정책/규제 변화
- **핵심 질문: "이걸로 빌더가 만드는 방식이 바뀌는가?"**

### 안 넣는다 (X)
- 투자/인수 가십
- 벤치마크만 있는 발표
- 밈/커뮤니티 잡담
- 추상적 비전 발표 ("10년 로드맵")
- B2C 앱 출시 (API 없음)
- 마이너 패치/버그픽스

## 3단계: 시그널 데이터 생성
판정이 O이면 아래 필드를 채운다:
- title: 제목 (한국어)
- summary: 2-3문장 요약
- action_point: "빌더가 당장 해볼 것" (가장 중요한 필드)
- source_url: 공식 원본 링크
- source_name: 발행자 (예: Anthropic, OpenAI, LG AI Research)
- signal_type: platform_launch | api_tool | open_model | policy
- tags: 관련 태그 배열
- published_at: 발표일

## 4단계: DB에 추가
```bash
source thenocodes-secrets/env.local && echo '<JSON>' | npx tsx scripts/add-signal.ts
```

## 5단계: 유저에게 결과 보고
- 추가 완료 시 사이트 URL과 함께 보고
- X 판정 시 이유 설명 + 카카오 오픈채팅에서 공유 제안

## signal_type 분류 기준
- platform_launch: 새 플랫폼, managed service, 인프라 (예: Claude Managed Agents)
- api_tool: 새 API, SDK, 개발자 도구 (예: GPT Actions API)
- open_model: 오픈소스 모델 공개 (예: LG 엑사원 4.5)
- policy: 한국 AI 정책, 규제, 지원사업 변화
