# The Nocodes Community - Design Document

**Date**: 2025-04-06
**Authors**: Cozac (코작), Song Gyuseon (송규선)
**Domain**: thenocodes.org (Cloudflare)

---

## 1. Vision

AI 시대에 실무 문제를 풀며 성장하는 커뮤니티 플랫폼.
비개발자와 주니어 개발자 모두를 위한 AI 활용 실전 챌린지 + 콘텐츠 허브.

## 2. Target Users

- **비개발자/노코더**: AI 도구를 활용해 실무 문제를 해결하고 싶은 기획자, 마케터, 디자이너
- **주니어 개발자**: AI를 활용한 개발 생산성 향상에 관심 있는 1-3년차 개발자

## 3. Core Features (MVP)

### 3.1 챌린지 시스템
- 주기적 챌린지 출제 (주간/격주)
- 난이도별 분류: 입문 / 중급 / 실전
- 카테고리: AI 자동화, 데이터 분석, 노코드 빌딩, 프롬프트 엔지니어링, 실전 프로젝트
- 사용자 풀이 제출 (GitHub 링크 or 텍스트)
- 커뮤니티 투표 + 우수 풀이 선정

### 3.2 문제 수집 파이프라인
- **소스 3가지**: 운영진 출제 / 커뮤니티 제안 / 기업 연계
- 문제 제안 폼 (`/challenges/propose`)
- 운영진 검수 → 난이도/태그 분류 → 스케줄링 → 발행
- 관리자 대시보드 (`/admin`)

### 3.3 리더보드 & 포인트
- 전체 / 월간 / 카테고리별 랭킹
- 포인트 시스템:
  - 챌린지 제출: +10
  - 투표 받음 (1표당): +2
  - 우수 풀이 선정: +30
  - 문제 제안 채택: +20
  - 블로그 기고: +15
- 뱃지: First Step, Streak, Problem Solver, Creator

### 3.4 블로그/콘텐츠
- AI 활용 팁, 튜토리얼
- 챌린지 풀이 해설
- 채용 정보 / 업계 소식

## 4. Site Structure

```
thenocodes.org
├── /                    → 랜딩 페이지
├── /challenges          → 챌린지 목록
├── /challenges/[slug]   → 챌린지 상세 + 제출
├── /challenges/propose  → 문제 제안
├── /leaderboard         → 리더보드
├── /blog                → 블로그
├── /blog/[slug]         → 블로그 상세
├── /about               → 소개
└── /admin               → 관리자 대시보드 (비공개)
```

## 5. Data Model

### users
| Column | Type | Note |
|--------|------|------|
| id | UUID | Supabase Auth |
| username | text | unique |
| display_name | text | |
| avatar_url | text | |
| bio | text | |
| role | enum | user / admin |
| total_points | int | default 0 |
| created_at | timestamp | |

### challenges
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| slug | text | unique, URL용 |
| title | text | |
| description | text | Markdown |
| category | enum | ai_automation / data / nocode / prompt / project |
| difficulty | enum | beginner / intermediate / advanced |
| tags | text[] | |
| status | enum | draft / active / closed |
| starts_at | timestamp | |
| ends_at | timestamp | |
| created_by | UUID | FK → users |
| source | enum | admin / community / company |
| company_name | text | nullable |

### submissions
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| challenge_id | UUID | FK → challenges |
| user_id | UUID | FK → users |
| content | text | |
| link_url | text | |
| vote_count | int | default 0 |
| is_featured | boolean | default false |
| created_at | timestamp | |

### votes
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| submission_id | UUID | FK → submissions |
| user_id | UUID | FK → users |
| created_at | timestamp | |
| | | UNIQUE(submission_id, user_id) |

### challenge_proposals
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| proposed_by | UUID | FK → users |
| title | text | |
| description | text | |
| category | enum | |
| difficulty_suggestion | enum | |
| real_world_context | text | |
| status | enum | pending / approved / rejected |
| reviewed_by | UUID | FK → users, nullable |
| created_at | timestamp | |

### blog_posts
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| slug | text | unique |
| title | text | |
| content | text | Markdown |
| author_id | UUID | FK → users |
| tags | text[] | |
| published_at | timestamp | |
| is_published | boolean | |

### point_logs
| Column | Type | Note |
|--------|------|------|
| id | UUID | |
| user_id | UUID | FK → users |
| points | int | |
| reason | enum | submission / vote_received / featured / proposal_accepted / blog |
| reference_id | UUID | |
| created_at | timestamp | |

## 6. Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Auth**: Supabase Auth (GitHub, Google OAuth)
- **Client Data Fetching**: SWR (deduplication, real-time revalidation)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **DNS/CDN**: Cloudflare
- **Domain**: thenocodes.org

## 6.1 Performance Guidelines (Vercel React Best Practices)

구현 시 반드시 따라야 할 성능 가이드라인.

### CRITICAL — 워터폴 제거
- 모든 페이지에서 독립적인 데이터 fetch는 `Promise.all()` 또는 별도 RSC + Suspense로 병렬화
- 챌린지 상세 페이지: 헤더(즉시) + Suspense(제출 목록) + Suspense(사이드바)로 분리
- 랜딩 페이지: 챌린지/리더보드/블로그를 각각 독립 RSC로 스트리밍

### CRITICAL — 번들 사이즈 최소화
- `next.config.js`에 `optimizePackageImports` 설정 (아이콘 등)
- Markdown 렌더러, Admin 대시보드는 `next/dynamic`으로 lazy load
- Analytics/광고 스크립트는 `dynamic(() => ..., { ssr: false })`로 hydration 이후 로드

### HIGH — 서버 컴포넌트 활용
- `/challenges`, `/blog`, `/leaderboard` 목록은 Server Component에서 fetch
- Client Component에는 최소 데이터만 props로 전달
- 필터/정렬/투표 등 인터랙션만 Client Component로 분리
- Server Actions에서는 반드시 인증 체크 (Supabase Auth 검증)

### MEDIUM-HIGH — 클라이언트 데이터 페칭
- 투표, 리더보드 등 실시간 업데이트 필요한 부분은 SWR 사용
- SWR의 automatic deduplication으로 중복 요청 방지

### MEDIUM — 렌더링 최적화
- 긴 목록에 CSS `content-visibility: auto` 적용
- 챌린지 카드 hover 시 `next/link` prefetch로 상세 페이지 preload
- 조건부 렌더링은 `&&` 대신 삼항 연산자 사용

## 7. User Participation Model (Win-Win)

거지맵 모델처럼 사용자 참여가 플랫폼 가치를 높이는 구조:
- 사용자 → 풀이 제출, 문제 제안, 투표 → 콘텐츠 자동 생성
- 플랫폼 → 포인트, 리더보드, 채용 연계, 노출 → 사용자에게 가치 제공
- 기업 → 실무 문제 제공 + 채용 파이프라인 → 우수 인재 발굴

## 8. Operations

### 운영진
- **코작**: 기술/개발 메인, 챌린지 공동 기획
- **송규선**: 서포트, 챌린지 공동 기획

### 수익화 로드맵
- Phase 1 (0-6개월): 완전 무료, 커뮤니티 성장 집중
- Phase 2 (6-12개월): 채용 공고 게재비, 스폰서십
- Phase 3 (12개월+): 유료 강의, 프리미엄 콘텐츠, 광고
