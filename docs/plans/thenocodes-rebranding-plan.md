# The Nocodes Rebranding & Reconstruction Plan

**Objective:** AI Slop 느낌(전형적인 AI 생성 코드, 공포 마케팅, 가짜 데이터)을 제거하고, 진짜 실무자가 참여하고 싶은 **"Quest Board"** 감성의 전문 커뮤니티로 개편.

## 1. Visual & Copywriting Pivot (Goodbye Slop!)

### 1.1 Copywriting (Tone of Voice)
- **Before**: "AI가 당신 자리를 뺏기 전에 진짜 실력을 증명하세요" (공포 마케팅, Slop 느낌)
- **After**: "실무의 반복 업무를 AI로 자동화하고, 당신의 시간을 되찾으세요" (가치 중심, Empowering)
- **Action**: `Hero.tsx`의 문구 전면 교체.

### 1.2 UI Theme (Bento-styled Dashboard)
- **Layout**: 단순 수직 나열에서 **Bento Grid** 기반 대시보드로 변경.
- **Accents**: 칙칙한 Gray 대신 **Lime Green (`#D9F99D`)**과 **Deep Indigo (`#6366F1`)**의 조화.
- **Glassmorphism**: 카드에 미세한 보더 그라데이션과 배경 흐림 효과 적용.

## 2. Dynamic Data & Authenticity (Goodbye Fake!)

### 2.1 Live Activity Feed (Real Data)
- **Before**: `Hero` 우측의 하드코딩된 '최근 활동' 박스.
- **After**: `submissions`, `votes`, `users` 테이블의 실제 최신 활동을 보여주는 **Live Stream Component**.
- **Action**: `src/lib/data/activity.ts` 신설 및 `ActivityFeed` 컴포넌트 구현.

### 2.2 Participation Stats (Social Proof)
- 챌린지 카드에 "현재 N명 참여 중", "총 N표 투표됨" 등 실제 데이터 표시.

## 3. Implementation Tasks

### Task 1: UI Theme & Global Layout
- [ ] `src/app/globals.css`를 더 깊이감 있는 Dark 테마로 재정의.
- [ ] `Header`를 더 슬림하고 모던하게 (Right-aligned menu, Better Logo).

### Task 2: Home Page (The Quest Board)
- [ ] **Bento Grid Layout**: 메인 페이지(`src/app/page.tsx`) 구조 전면 개편.
- [ ] **Hero Section**: 가짜 활동 박스 제거 -> 실시간 통계(참여자 수 등)와 명확한 가치 제안.
- [ ] **Active Quests**: 챌린지 카드 디자인 개선 (참여 데이터 시각화).
- [ ] **Live Activity**: 실제 제출/투표 이력을 스트리밍하는 피드 컴포넌트 추가.

### Task 3: Data Logic Cleanup
- [ ] 가짜 하드코딩 데이터 모두 제거.
- [ ] `submissions` 및 `users` 데이터 페칭 시 필요한 필드만 조인하여 최적화.

### Task 4: Content & Value
- [ ] 뜬금없는 중간 광고(`NativeAd`) 제거. 대신 하단에 자연스러운 "추천 도구" 섹션으로 배치.

## 4. Verification
- [ ] 메인 페이지 로딩 시 가짜 데이터가 없는지 확인.
- [ ] 실시간 활동 피드가 실제 DB 데이터와 일치하는지 확인.
- [ ] 모바일 환경에서도 벤토 그리드가 적절히 반응하는지 확인.
