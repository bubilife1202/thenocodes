# The Nocodes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** thenocodes.org MVP — AI 실무 챌린지 플랫폼 (랜딩 + 챌린지 + 리더보드 + 블로그 + 관리자)

**Architecture:** Next.js 15 App Router로 서버 컴포넌트 중심 렌더링. Supabase가 DB/Auth/Storage 전담. 페이지 간 데이터는 Suspense 스트리밍으로 병렬화. 투표 등 인터랙션만 Client Component + SWR.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + Auth), SWR, Vercel, Cloudflare DNS

**Design Doc:** `docs/plans/2025-04-06-thenocodes-community-design.md`

**Performance Guidelines:** `@vercel-react-best-practices` — 워터폴 제거, 번들 최소화, RSC 활용 필수

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.gitignore`

**Step 1: Initialize Next.js project**

```bash
cd /Users/cozac/Code/thenocodes
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Select defaults: Yes to all prompts.

**Step 2: Install dependencies**

```bash
cd /Users/cozac/Code/thenocodes
npm install @supabase/supabase-js @supabase/ssr swr
npm install -D supabase
```

**Step 3: Create environment template**

Create `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Step 4: Configure next.config.ts for performance**

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
```

**Step 5: Verify dev server starts**

```bash
cd /Users/cozac/Code/thenocodes
npm run dev
```

Expected: Dev server starts on http://localhost:3000, default Next.js page renders.

**Step 6: Initialize git and commit**

```bash
cd /Users/cozac/Code/thenocodes
git init
git add .
git commit -m "chore: scaffold Next.js 15 project with TypeScript and Tailwind"
```

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts` (browser client)
- Create: `src/lib/supabase/server.ts` (server client)
- Create: `src/lib/supabase/middleware.ts` (auth middleware)
- Create: `src/middleware.ts` (Next.js middleware)

**Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

**Step 3: Create middleware for auth session refresh**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 4: Verify build succeeds**

```bash
cd /Users/cozac/Code/thenocodes
npm run build
```

Expected: Build succeeds (no type errors).

**Step 5: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/lib/supabase/ src/middleware.ts .env.local.example
git commit -m "feat: add Supabase client setup with SSR auth middleware"
```

---

## Task 3: Database Schema (Supabase Migration)

**Files:**
- Create: `supabase/migrations/00001_initial_schema.sql`

**Step 1: Initialize Supabase locally**

```bash
cd /Users/cozac/Code/thenocodes
npx supabase init
```

**Step 2: Create migration file**

Create `supabase/migrations/00001_initial_schema.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom types
create type user_role as enum ('user', 'admin');
create type challenge_category as enum ('ai_automation', 'data', 'nocode', 'prompt', 'project');
create type challenge_difficulty as enum ('beginner', 'intermediate', 'advanced');
create type challenge_status as enum ('draft', 'active', 'closed');
create type challenge_source as enum ('admin', 'community', 'company');
create type proposal_status as enum ('pending', 'approved', 'rejected');
create type point_reason as enum ('submission', 'vote_received', 'featured', 'proposal_accepted', 'blog');

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role user_role default 'user' not null,
  total_points integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Challenges
create table public.challenges (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  category challenge_category not null,
  difficulty challenge_difficulty not null,
  tags text[] default '{}',
  status challenge_status default 'draft' not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.users(id) not null,
  source challenge_source default 'admin' not null,
  company_name text,
  created_at timestamptz default now() not null
);

alter table public.challenges enable row level security;

create policy "Active challenges are viewable by everyone"
  on public.challenges for select using (status = 'active' or status = 'closed');

create policy "Admins can manage all challenges"
  on public.challenges for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Submissions
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  link_url text,
  vote_count integer default 0 not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.submissions enable row level security;

create policy "Submissions are viewable by everyone"
  on public.submissions for select using (true);

create policy "Authenticated users can submit"
  on public.submissions for insert with check (auth.uid() = user_id);

create policy "Users can update own submissions"
  on public.submissions for update using (auth.uid() = user_id);

-- Votes
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(submission_id, user_id)
);

alter table public.votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = user_id);

create policy "Users can remove own votes"
  on public.votes for delete using (auth.uid() = user_id);

-- Challenge Proposals
create table public.challenge_proposals (
  id uuid default uuid_generate_v4() primary key,
  proposed_by uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  category challenge_category not null,
  difficulty_suggestion challenge_difficulty not null,
  real_world_context text,
  status proposal_status default 'pending' not null,
  reviewed_by uuid references public.users(id),
  created_at timestamptz default now() not null
);

alter table public.challenge_proposals enable row level security;

create policy "Users can view own proposals"
  on public.challenge_proposals for select using (auth.uid() = proposed_by);

create policy "Admins can view all proposals"
  on public.challenge_proposals for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can propose"
  on public.challenge_proposals for insert with check (auth.uid() = proposed_by);

create policy "Admins can update proposals"
  on public.challenge_proposals for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Blog Posts
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  content text not null,
  author_id uuid references public.users(id) not null,
  tags text[] default '{}',
  published_at timestamptz,
  is_published boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.blog_posts enable row level security;

create policy "Published posts are viewable by everyone"
  on public.blog_posts for select using (is_published = true);

create policy "Admins can manage all posts"
  on public.blog_posts for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Point Logs
create table public.point_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  points integer not null,
  reason point_reason not null,
  reference_id uuid,
  created_at timestamptz default now() not null
);

alter table public.point_logs enable row level security;

create policy "Users can view own point logs"
  on public.point_logs for select using (auth.uid() = user_id);

-- Indexes
create index idx_challenges_status on public.challenges(status);
create index idx_challenges_category on public.challenges(category);
create index idx_challenges_slug on public.challenges(slug);
create index idx_submissions_challenge on public.submissions(challenge_id);
create index idx_submissions_user on public.submissions(user_id);
create index idx_votes_submission on public.votes(submission_id);
create index idx_blog_posts_published on public.blog_posts(is_published, published_at desc);
create index idx_users_points on public.users(total_points desc);
create index idx_point_logs_user on public.point_logs(user_id);

-- Function: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update vote count on submissions
create or replace function public.update_vote_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.submissions set vote_count = vote_count + 1 where id = NEW.submission_id;
    -- Award point to submission author
    insert into public.point_logs (user_id, points, reason, reference_id)
    select user_id, 2, 'vote_received', NEW.submission_id
    from public.submissions where id = NEW.submission_id;
    -- Update total points
    update public.users set total_points = total_points + 2
    where id = (select user_id from public.submissions where id = NEW.submission_id);
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.submissions set vote_count = vote_count - 1 where id = OLD.submission_id;
    -- Deduct point from submission author
    update public.users set total_points = total_points - 2
    where id = (select user_id from public.submissions where id = OLD.submission_id);
    return OLD;
  end if;
end;
$$;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute procedure public.update_vote_count();
```

**Step 3: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add supabase/
git commit -m "feat: add database schema with RLS policies, triggers, and indexes"
```

---

## Task 4: TypeScript Types & Data Access Layer

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/data/challenges.ts`
- Create: `src/lib/data/submissions.ts`
- Create: `src/lib/data/users.ts`
- Create: `src/lib/data/blog.ts`

**Step 1: Create shared types**

Create `src/lib/types.ts`:
```typescript
export type UserRole = "user" | "admin";
export type ChallengeCategory = "ai_automation" | "data" | "nocode" | "prompt" | "project";
export type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";
export type ChallengeStatus = "draft" | "active" | "closed";
export type ChallengeSource = "admin" | "community" | "company";
export type ProposalStatus = "pending" | "approved" | "rejected";
export type PointReason = "submission" | "vote_received" | "featured" | "proposal_accepted" | "blog";

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  total_points: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  tags: string[];
  status: ChallengeStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string;
  source: ChallengeSource;
  company_name: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  content: string;
  link_url: string | null;
  vote_count: number;
  is_featured: boolean;
  created_at: string;
  // Joined fields
  user?: Pick<User, "username" | "display_name" | "avatar_url">;
}

export interface Vote {
  id: string;
  submission_id: string;
  user_id: string;
  created_at: string;
}

export interface ChallengeProposal {
  id: string;
  proposed_by: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty_suggestion: ChallengeDifficulty;
  real_world_context: string | null;
  status: ProposalStatus;
  reviewed_by: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author_id: string;
  tags: string[];
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  // Joined fields
  author?: Pick<User, "username" | "display_name" | "avatar_url">;
}

export interface PointLog {
  id: string;
  user_id: string;
  points: number;
  reason: PointReason;
  reference_id: string | null;
  created_at: string;
}

// UI helper types
export const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  ai_automation: "AI 자동화",
  data: "데이터 분석",
  nocode: "노코드 빌딩",
  prompt: "프롬프트 엔지니어링",
  project: "실전 프로젝트",
};

export const DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "실전",
};
```

**Step 2: Create data access functions**

Create `src/lib/data/challenges.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/types";

export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "active")
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getAllChallenges(status?: string): Promise<Challenge[]> {
  const supabase = await createClient();
  let query = supabase
    .from("challenges")
    .select("*")
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = supabase
      .from("challenges")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
```

Create `src/lib/data/submissions.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";

export async function getSubmissionsByChallenge(challengeId: string): Promise<Submission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      *,
      user:users(username, display_name, avatar_url)
    `)
    .eq("challenge_id", challengeId)
    .order("vote_count", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
```

Create `src/lib/data/users.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

export async function getTopUsers(limit: number = 10): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) return null;
  return data;
}
```

Create `src/lib/data/blog.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";

export async function getPublishedPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:users(username, display_name, avatar_url)
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:users(username, display_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}
```

**Step 3: Verify build**

```bash
cd /Users/cozac/Code/thenocodes
npm run build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/lib/
git commit -m "feat: add TypeScript types and data access layer for all entities"
```

---

## Task 5: Auth (Login/Logout + Protected Routes)

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/login-button.tsx`
- Create: `src/components/auth/user-menu.tsx`
- Create: `src/lib/actions/auth.ts`

**Step 1: Create OAuth callback route**

Create `src/app/auth/callback/route.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

**Step 2: Create auth server actions**

Create `src/lib/actions/auth.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGitHub() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

**Step 3: Create login page**

Create `src/app/login/page.tsx`:
```tsx
import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full p-8 bg-gray-900 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          The Nocodes 로그인
        </h1>
        <p className="text-gray-400 text-center mb-8">
          AI 시대, 실무 문제를 풀며 성장하세요
        </p>
        <div className="space-y-3">
          <form action={signInWithGitHub}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
            >
              GitHub로 로그인
            </button>
          </form>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors"
            >
              Google로 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Create user menu component (Client Component)**

Create `src/components/auth/user-menu.tsx`:
```tsx
"use client";

import { signOut } from "@/lib/actions/auth";
import type { User } from "@/lib/types";
import Link from "next/link";

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">{user.display_name ?? user.username}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}

export function LoginButton() {
  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
    >
      로그인
    </Link>
  );
}
```

**Step 5: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/auth/ src/app/login/ src/components/auth/ src/lib/actions/
git commit -m "feat: add GitHub/Google OAuth login, callback, and user menu"
```

---

## Task 6: Shared Layout & Navigation

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Modify: `src/app/globals.css`

**Step 1: Create header (Server Component with Client auth island)**

Create `src/components/layout/header.tsx`:
```tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/users";
import { UserMenu, LoginButton } from "@/components/auth/user-menu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            The Nocodes
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/challenges" className="text-sm text-gray-400 hover:text-white transition-colors">
              챌린지
            </Link>
            <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              리더보드
            </Link>
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
              블로그
            </Link>
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              소개
            </Link>
          </nav>
        </div>
        {user ? <UserMenu user={user} /> : <LoginButton />}
      </div>
    </header>
  );
}
```

**Step 2: Create footer**

Create `src/components/layout/footer.tsx`:
```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-lg font-bold text-white">The Nocodes</p>
            <p className="text-sm text-gray-500 mt-1">AI 시대, 실무 문제를 풀며 성장하세요</p>
          </div>
          <div className="flex gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">플랫폼</p>
              <Link href="/challenges" className="block text-sm text-gray-500 hover:text-gray-300">챌린지</Link>
              <Link href="/leaderboard" className="block text-sm text-gray-500 hover:text-gray-300">리더보드</Link>
              <Link href="/blog" className="block text-sm text-gray-500 hover:text-gray-300">블로그</Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">정보</p>
              <Link href="/about" className="block text-sm text-gray-500 hover:text-gray-300">소개</Link>
              <Link href="/challenges/propose" className="block text-sm text-gray-500 hover:text-gray-300">문제 제안</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} The Nocodes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Update root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Nocodes - AI 시대의 실무 챌린지 플랫폼",
  description: "AI 시대, 실무 문제를 풀며 성장하는 커뮤니티. 비개발자와 주니어 개발자 모두를 위한 실전 챌린지 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Step 4: Update globals.css for dark theme base**

Replace `src/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --background: #030712;
  --foreground: #f3f4f6;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

**Step 5: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/layout.tsx src/app/globals.css src/components/layout/
git commit -m "feat: add shared layout with header navigation and footer"
```

---

## Task 7: Landing Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/home/hero.tsx`
- Create: `src/components/home/active-challenges.tsx`
- Create: `src/components/home/top-users.tsx`
- Create: `src/components/home/latest-posts.tsx`

**Step 1: Create hero component**

Create `src/components/home/hero.tsx`:
```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
          AI 시대의 실무 챌린지 플랫폼
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          실무 문제를 풀며
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            함께 성장하세요
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          AI 활용, 데이터 분석, 노코드 빌딩 — 실제 업무에서 만나는 문제들을 풀고,
          커뮤니티와 함께 성장하는 챌린지 플랫폼입니다.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/challenges"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            챌린지 참여하기
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors"
          >
            더 알아보기
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Create active challenges preview (RSC with Suspense)**

Create `src/components/home/active-challenges.tsx`:
```tsx
import Link from "next/link";
import { getActiveChallenges } from "@/lib/data/challenges";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export async function ActiveChallenges() {
  const challenges = await getActiveChallenges();
  const displayed = challenges.slice(0, 3);

  if (displayed.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        아직 진행 중인 챌린지가 없습니다. 곧 새로운 챌린지가 시작됩니다!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {displayed.map((challenge) => (
        <Link
          key={challenge.id}
          href={`/challenges/${challenge.slug}`}
          className="group p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
              {CATEGORY_LABELS[challenge.category]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {DIFFICULTY_LABELS[challenge.difficulty]}
            </span>
          </div>
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {challenge.description.slice(0, 100)}...
          </p>
          {challenge.ends_at ? (
            <p className="text-xs text-gray-600 mt-3">
              마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
```

**Step 3: Create top users preview**

Create `src/components/home/top-users.tsx`:
```tsx
import { getTopUsers } from "@/lib/data/users";
import Link from "next/link";

export async function TopUsers() {
  const users = await getTopUsers(5);

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 참여자가 없습니다. 첫 번째 챌린저가 되어보세요!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, i) => (
        <div
          key={user.id}
          className="flex items-center gap-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
        >
          <span className="text-lg font-bold text-gray-600 w-8 text-center">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.display_name ?? user.username}
            </p>
          </div>
          <span className="text-sm font-semibold text-indigo-400">
            {user.total_points} pts
          </span>
        </div>
      ))}
      <Link
        href="/leaderboard"
        className="block text-center text-sm text-gray-500 hover:text-indigo-400 transition-colors pt-2"
      >
        전체 리더보드 보기 &rarr;
      </Link>
    </div>
  );
}
```

**Step 4: Create latest posts preview**

Create `src/components/home/latest-posts.tsx`:
```tsx
import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/blog";

export async function LatestPosts() {
  const posts = await getPublishedPosts(3);

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 게시글이 없습니다. 곧 유용한 콘텐츠가 올라옵니다!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="block p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
        >
          <h3 className="font-medium text-white mb-1">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {post.author?.display_name} &middot;{" "}
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("ko-KR")
              : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}
```

**Step 5: Assemble landing page with Suspense boundaries (parallel streaming)**

Replace `src/app/page.tsx`:
```tsx
import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { ActiveChallenges } from "@/components/home/active-challenges";
import { TopUsers } from "@/components/home/top-users";
import { LatestPosts } from "@/components/home/latest-posts";

function SectionSkeleton() {
  return <div className="animate-pulse bg-gray-800/50 rounded-xl h-48" />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 pb-24 space-y-16">
        {/* Active Challenges — streams independently */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">진행 중인 챌린지</h2>
          <Suspense fallback={<SectionSkeleton />}>
            <ActiveChallenges />
          </Suspense>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Users — streams independently */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">TOP 리더보드</h2>
            <Suspense fallback={<SectionSkeleton />}>
              <TopUsers />
            </Suspense>
          </section>

          {/* Latest Posts — streams independently */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">최신 콘텐츠</h2>
            <Suspense fallback={<SectionSkeleton />}>
              <LatestPosts />
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}
```

**Step 6: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/page.tsx src/components/home/
git commit -m "feat: add landing page with hero, challenges, leaderboard, and blog previews"
```

---

## Task 8: Challenges List Page

**Files:**
- Create: `src/app/challenges/page.tsx`
- Create: `src/components/challenges/challenge-card.tsx`
- Create: `src/components/challenges/challenge-filters.tsx`

**Step 1: Create challenge card component**

Create `src/components/challenges/challenge-card.tsx`:
```tsx
import Link from "next/link";
import type { Challenge } from "@/lib/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isActive = challenge.status === "active";

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="group block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 200px" }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isActive
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-gray-800 text-gray-500"
        }`}>
          {isActive ? "진행 중" : "마감"}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
          {CATEGORY_LABELS[challenge.category]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {DIFFICULTY_LABELS[challenge.difficulty]}
        </span>
        {challenge.source === "company" && challenge.company_name ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            {challenge.company_name}
          </span>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
        {challenge.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {challenge.description.slice(0, 150)}...
      </p>
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {challenge.starts_at ? (
          <span>시작: {new Date(challenge.starts_at).toLocaleDateString("ko-KR")}</span>
        ) : null}
        {challenge.ends_at ? (
          <span>마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}</span>
        ) : null}
      </div>
    </Link>
  );
}
```

**Step 2: Create filter component (Client Component)**

Create `src/components/challenges/challenge-filters.tsx`:
```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export function ChallengeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/challenges?${params.toString()}`);
  }

  const statuses = [
    { value: "all", label: "전체" },
    { value: "active", label: "진행 중" },
    { value: "closed", label: "마감" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleStatusChange(s.value)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentStatus === s.value
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 3: Create challenges page (RSC)**

Create `src/app/challenges/page.tsx`:
```tsx
import { Suspense } from "react";
import Link from "next/link";
import { getAllChallenges } from "@/lib/data/challenges";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { ChallengeFilters } from "@/components/challenges/challenge-filters";

export const metadata = {
  title: "챌린지 - The Nocodes",
  description: "AI 활용 실무 챌린지에 참여하세요",
};

async function ChallengeList({ status }: { status?: string }) {
  const challenges = await getAllChallenges(status);

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        해당 조건의 챌린지가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">챌린지</h1>
          <p className="text-gray-400 mt-1">AI 시대의 실무 문제를 풀어보세요</p>
        </div>
        <Link
          href="/challenges/propose"
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
        >
          문제 제안하기
        </Link>
      </div>

      <Suspense fallback={null}>
        <ChallengeFilters />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />}>
          <ChallengeList status={status} />
        </Suspense>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/challenges/page.tsx src/components/challenges/
git commit -m "feat: add challenges list page with filters and card component"
```

---

## Task 9: Challenge Detail Page + Submission

**Files:**
- Create: `src/app/challenges/[slug]/page.tsx`
- Create: `src/components/challenges/submission-form.tsx`
- Create: `src/components/challenges/submission-list.tsx`
- Create: `src/components/challenges/vote-button.tsx`
- Create: `src/lib/actions/submissions.ts`
- Create: `src/lib/actions/votes.ts`

**Step 1: Create submission server action**

Create `src/lib/actions/submissions.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSubmission(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const challengeId = formData.get("challenge_id") as string;
  const content = formData.get("content") as string;
  const linkUrl = formData.get("link_url") as string;

  const { error } = await supabase.from("submissions").insert({
    challenge_id: challengeId,
    user_id: user.id,
    content,
    link_url: linkUrl || null,
  });

  if (error) throw error;

  // Award points for submission
  await supabase.from("point_logs").insert({
    user_id: user.id,
    points: 10,
    reason: "submission",
    reference_id: challengeId,
  });

  await supabase.rpc("increment_user_points", { uid: user.id, pts: 10 }).catch(() => {
    // fallback: direct update
    return supabase
      .from("users")
      .update({ total_points: supabase.rpc ? undefined : 0 })
      .eq("id", user.id);
  });

  // Simple fallback: direct SQL update via raw update
  await supabase
    .from("users")
    .update({ total_points: 0 }) // This will be handled by proper RPC
    .eq("id", user.id)
    .select("total_points")
    .single()
    .then(async ({ data: userData }) => {
      if (userData) {
        await supabase
          .from("users")
          .update({ total_points: (userData.total_points ?? 0) + 10 })
          .eq("id", user.id);
      }
    });

  revalidatePath(`/challenges`);
}
```

**Step 2: Create vote server action**

Create `src/lib/actions/votes.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleVote(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    // Remove vote
    await supabase.from("votes").delete().eq("id", existingVote.id);
  } else {
    // Add vote (trigger handles vote_count + points)
    await supabase.from("votes").insert({
      submission_id: submissionId,
      user_id: user.id,
    });
  }

  revalidatePath("/challenges");
}
```

**Step 3: Create submission form (Client Component)**

Create `src/components/challenges/submission-form.tsx`:
```tsx
"use client";

import { createSubmission } from "@/lib/actions/submissions";
import { useRef } from "react";

export function SubmissionForm({
  challengeId,
  isLoggedIn,
}: {
  challengeId: string;
  isLoggedIn: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isLoggedIn) {
    return (
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl text-center">
        <p className="text-gray-400">풀이를 제출하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    await createSubmission(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-white">풀이 제출</h3>
      <input type="hidden" name="challenge_id" value={challengeId} />
      <div>
        <label className="block text-sm text-gray-400 mb-1">풀이 설명</label>
        <textarea
          name="content"
          required
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="풀이 과정과 결과를 설명해주세요..."
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">링크 (선택)</label>
        <input
          name="link_url"
          type="url"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          placeholder="GitHub, 배포 URL 등"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
      >
        제출하기
      </button>
    </form>
  );
}
```

**Step 4: Create vote button (Client Component)**

Create `src/components/challenges/vote-button.tsx`:
```tsx
"use client";

import { toggleVote } from "@/lib/actions/votes";

export function VoteButton({
  submissionId,
  voteCount,
  hasVoted,
  isLoggedIn,
}: {
  submissionId: string;
  voteCount: number;
  hasVoted: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <form action={() => toggleVote(submissionId)}>
      <button
        type="submit"
        disabled={!isLoggedIn}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          hasVoted
            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
        } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isLoggedIn ? (hasVoted ? "투표 취소" : "투표하기") : "로그인 필요"}
      >
        <span>{hasVoted ? "▲" : "△"}</span>
        <span>{voteCount}</span>
      </button>
    </form>
  );
}
```

**Step 5: Create submission list (RSC)**

Create `src/components/challenges/submission-list.tsx`:
```tsx
import { getSubmissionsByChallenge } from "@/lib/data/submissions";
import { VoteButton } from "./vote-button";
import { createClient } from "@/lib/supabase/server";

export async function SubmissionList({ challengeId }: { challengeId: string }) {
  const [submissions, supabase] = await Promise.all([
    getSubmissionsByChallenge(challengeId),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Get user's votes for these submissions
  let userVotes: Set<string> = new Set();
  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("submission_id")
      .eq("user_id", user.id)
      .in("submission_id", submissions.map((s) => s.id));
    userVotes = new Set(votes?.map((v) => v.submission_id) ?? []);
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 제출된 풀이가 없습니다. 첫 번째로 풀이를 제출해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className={`p-5 bg-gray-900/50 border rounded-xl ${
            submission.is_featured
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-gray-800"
          }`}
        >
          <div className="flex items-start gap-4">
            <VoteButton
              submissionId={submission.id}
              voteCount={submission.vote_count}
              hasVoted={userVotes.has(submission.id)}
              isLoggedIn={isLoggedIn}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-white">
                  {submission.user?.display_name ?? submission.user?.username ?? "익명"}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(submission.created_at).toLocaleDateString("ko-KR")}
                </span>
                {submission.is_featured ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    우수 풀이
                  </span>
                ) : null}
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{submission.content}</p>
              {submission.link_url ? (
                <a
                  href={submission.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  {submission.link_url} &rarr;
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 6: Create challenge detail page with Suspense**

Create `src/app/challenges/[slug]/page.tsx`:
```tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getChallengeBySlug } from "@/lib/data/challenges";
import { getCurrentUser } from "@/lib/data/users";
import { SubmissionForm } from "@/components/challenges/submission-form";
import { SubmissionList } from "@/components/challenges/submission-list";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [challenge, user] = await Promise.all([
    getChallengeBySlug(slug),
    getCurrentUser(),
  ]);

  if (!challenge) notFound();

  const isActive = challenge.status === "active";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Challenge Header — renders immediately */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isActive
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-gray-800 text-gray-500"
          }`}>
            {isActive ? "진행 중" : "마감"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
            {CATEGORY_LABELS[challenge.category]}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{challenge.title}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap">{challenge.description}</p>
        </div>
        {challenge.ends_at ? (
          <p className="text-sm text-gray-500 mt-4">
            마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}
          </p>
        ) : null}
      </div>

      {/* Submission Form — only if active */}
      {isActive ? (
        <div className="mb-12">
          <SubmissionForm challengeId={challenge.id} isLoggedIn={!!user} />
        </div>
      ) : null}

      {/* Submissions — streams via Suspense */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">제출된 풀이</h2>
        <Suspense fallback={<div className="animate-pulse bg-gray-800/50 rounded-xl h-48" />}>
          <SubmissionList challengeId={challenge.id} />
        </Suspense>
      </section>
    </div>
  );
}
```

**Step 7: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/challenges/\[slug\]/ src/components/challenges/ src/lib/actions/
git commit -m "feat: add challenge detail page with submission form, voting, and Suspense streaming"
```

---

## Task 10: Leaderboard Page

**Files:**
- Create: `src/app/leaderboard/page.tsx`

**Step 1: Create leaderboard page**

Create `src/app/leaderboard/page.tsx`:
```tsx
import { getTopUsers } from "@/lib/data/users";

export const metadata = {
  title: "리더보드 - The Nocodes",
  description: "The Nocodes 챌린지 리더보드",
};

export default async function LeaderboardPage() {
  const users = await getTopUsers(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">리더보드</h1>
      <p className="text-gray-400 mb-8">챌린지 참여를 통해 포인트를 모으세요</p>

      <div className="space-y-2">
        {users.map((user, i) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              i < 3
                ? "bg-indigo-500/5 border-indigo-500/20"
                : "bg-gray-900/50 border-gray-800"
            }`}
          >
            <span className={`text-xl font-bold w-10 text-center ${
              i === 0 ? "text-yellow-400" :
              i === 1 ? "text-gray-300" :
              i === 2 ? "text-amber-600" :
              "text-gray-600"
            }`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {user.display_name ?? user.username}
              </p>
              {user.bio ? (
                <p className="text-xs text-gray-500 truncate">{user.bio}</p>
              ) : null}
            </div>
            <span className="text-lg font-bold text-indigo-400">
              {user.total_points}
              <span className="text-xs text-gray-500 ml-1">pts</span>
            </span>
          </div>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          아직 참여자가 없습니다. 첫 번째 챌린저가 되어보세요!
        </div>
      ) : null}
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/leaderboard/
git commit -m "feat: add leaderboard page with top 50 users"
```

---

## Task 11: Blog Pages

**Files:**
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`

**Step 1: Create blog list page**

Create `src/app/blog/page.tsx`:
```tsx
import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/blog";

export const metadata = {
  title: "블로그 - The Nocodes",
  description: "AI 활용 팁, 챌린지 풀이 해설, 채용 정보",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">블로그</h1>
      <p className="text-gray-400 mb-8">AI 활용 팁, 챌린지 풀이 해설, 채용 정보</p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
            <p className="text-sm text-gray-500">
              {post.author?.display_name ?? post.author?.username} &middot;{" "}
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("ko-KR")
                : ""}
            </p>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          아직 게시글이 없습니다. 곧 유용한 콘텐츠가 올라옵니다!
        </div>
      ) : null}
    </div>
  );
}
```

**Step 2: Create blog detail page with dynamic Markdown renderer**

Create `src/app/blog/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data/blog";
import dynamic from "next/dynamic";

const MarkdownContent = dynamic(() => import("@/components/blog/markdown-content"), {
  loading: () => <div className="animate-pulse bg-gray-800/50 rounded h-96" />,
});

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
        <p className="text-sm text-gray-500">
          {post.author?.display_name ?? post.author?.username} &middot;{" "}
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString("ko-KR")
            : ""}
        </p>
      </div>
      <MarkdownContent content={post.content} />
    </article>
  );
}
```

Create `src/components/blog/markdown-content.tsx`:
```tsx
"use client";

// Simple markdown renderer — can be replaced with react-markdown later
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-indigo-400 prose-code:text-indigo-300">
      {/* For MVP, render as pre-wrapped text. Replace with react-markdown later */}
      <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
        {content}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/blog/ src/components/blog/
git commit -m "feat: add blog list and detail pages with dynamic markdown renderer"
```

---

## Task 12: Challenge Proposal Page

**Files:**
- Create: `src/app/challenges/propose/page.tsx`
- Create: `src/lib/actions/proposals.ts`

**Step 1: Create proposal server action**

Create `src/lib/actions/proposals.ts`:
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase.from("challenge_proposals").insert({
    proposed_by: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    difficulty_suggestion: formData.get("difficulty") as string,
    real_world_context: (formData.get("real_world_context") as string) || null,
  });

  if (error) throw error;

  redirect("/challenges?proposed=true");
}
```

**Step 2: Create proposal page**

Create `src/app/challenges/propose/page.tsx`:
```tsx
import { getCurrentUser } from "@/lib/data/users";
import { createProposal } from "@/lib/actions/proposals";
import { redirect } from "next/navigation";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export const metadata = {
  title: "문제 제안 - The Nocodes",
  description: "AI 실무 챌린지 문제를 제안해주세요",
};

export default async function ProposePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">문제 제안</h1>
      <p className="text-gray-400 mb-8">
        실무에서 만났던 문제, AI로 풀면 좋을 과제를 제안해주세요.
        채택되면 +20 포인트!
      </p>

      <form action={createProposal} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            제목
          </label>
          <input
            name="title"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="챌린지 문제 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            문제 설명
          </label>
          <textarea
            name="description"
            required
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="문제를 상세히 설명해주세요. 배경, 요구사항, 예상 결과물 등"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              카테고리
            </label>
            <select
              name="category"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              난이도 제안
            </label>
            <select
              name="difficulty"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            실무 활용 사례 (선택)
          </label>
          <textarea
            name="real_world_context"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="이 문제가 실무에서 어떻게 활용될 수 있는지 설명해주세요"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          문제 제안하기
        </button>
      </form>
    </div>
  );
}
```

**Step 3: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/challenges/propose/ src/lib/actions/proposals.ts
git commit -m "feat: add challenge proposal page with form and server action"
```

---

## Task 13: About Page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Create about page**

Create `src/app/about/page.tsx`:
```tsx
export const metadata = {
  title: "소개 - The Nocodes",
  description: "The Nocodes 커뮤니티 소개",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">The Nocodes</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-3">비전</h2>
        <p className="text-gray-300 leading-relaxed">
          AI 시대에 실무 문제를 풀며 성장하는 커뮤니티 플랫폼입니다.
          비개발자와 주니어 개발자 모두가 AI를 활용해 실제 업무에서 만나는
          문제를 해결하고, 함께 성장할 수 있는 공간을 만들고 있습니다.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-3">무엇을 할 수 있나요?</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">🏆</span>
            <span>주간/격주 챌린지에 참여하여 실무 문제를 풀어보세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">💡</span>
            <span>직접 문제를 제안하고, 채택되면 포인트를 받으세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">📊</span>
            <span>리더보드에서 실력을 인정받고, 채용 기회를 얻으세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">📰</span>
            <span>AI 활용 팁과 최신 트렌드를 블로그에서 확인하세요</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">운영진</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="font-semibold text-white text-lg">코작 (Cozac)</p>
            <p className="text-sm text-indigo-400 mb-2">Co-Founder & Tech Lead</p>
            <p className="text-sm text-gray-400">기술/개발 메인, 챌린지 기획</p>
          </div>
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="font-semibold text-white text-lg">송규선</p>
            <p className="text-sm text-indigo-400 mb-2">Co-Founder & Operations</p>
            <p className="text-sm text-gray-400">개발 서포트, 챌린지 기획, 커뮤니티 관리</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">참여 방법</h2>
        <div className="space-y-4 text-gray-300">
          <p>1. GitHub 또는 Google 계정으로 로그인하세요</p>
          <p>2. 진행 중인 챌린지를 확인하고 풀이를 제출하세요</p>
          <p>3. 다른 참여자의 풀이에 투표하세요</p>
          <p>4. 좋은 문제가 있다면 직접 제안해보세요</p>
        </div>
      </section>
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/about/
git commit -m "feat: add about page with vision, team, and participation guide"
```

---

## Task 14: Admin Dashboard (Basic)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/challenges/page.tsx`
- Create: `src/app/admin/proposals/page.tsx`

**Step 1: Create admin layout with auth guard**

Create `src/app/admin/layout.tsx`:
```tsx
import { getCurrentUser } from "@/lib/data/users";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold text-white">Admin</h1>
        <nav className="flex gap-4">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">대시보드</Link>
          <Link href="/admin/challenges" className="text-sm text-gray-400 hover:text-white">챌린지 관리</Link>
          <Link href="/admin/proposals" className="text-sm text-gray-400 hover:text-white">문제 제안</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
```

**Step 2: Create admin dashboard overview**

Create `src/app/admin/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: challengeCount },
    { count: submissionCount },
    { count: proposalCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("challenges").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("challenge_proposals").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "총 사용자", value: userCount ?? 0 },
    { label: "총 챌린지", value: challengeCount ?? 0 },
    { label: "총 제출", value: submissionCount ?? 0 },
    { label: "대기 중 제안", value: proposalCount ?? 0 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">대시보드</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Create admin challenges page (with create form)**

Create `src/app/admin/challenges/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

async function createChallenge(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/(^-|-$)/g, "");

  await supabase.from("challenges").insert({
    slug,
    title,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    difficulty: formData.get("difficulty") as string,
    status: formData.get("status") as string,
    starts_at: formData.get("starts_at") || null,
    ends_at: formData.get("ends_at") || null,
    created_by: user.id,
    source: formData.get("source") as string,
    company_name: (formData.get("company_name") as string) || null,
  });

  revalidatePath("/admin/challenges");
}

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">챌린지 관리</h2>

      {/* Create form */}
      <form action={createChallenge} className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-white">새 챌린지</h3>
        <input name="title" required placeholder="제목" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        <textarea name="description" required rows={4} placeholder="설명 (Markdown)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select name="category" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="difficulty" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="status" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <select name="source" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            <option value="admin">Admin</option>
            <option value="community">Community</option>
            <option value="company">Company</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input name="starts_at" type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          <input name="ends_at" type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          <input name="company_name" placeholder="기업명 (선택)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
        </div>
        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">생성</button>
      </form>

      {/* Challenge list */}
      <div className="space-y-2">
        {challenges?.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">{c.title}</p>
              <p className="text-xs text-gray-500">/{c.slug} &middot; {c.status} &middot; {c.category}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              c.status === "active" ? "bg-green-500/10 text-green-400" :
              c.status === "draft" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-gray-800 text-gray-500"
            }`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create admin proposals page**

Create `src/app/admin/proposals/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateProposalStatus(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase
    .from("challenge_proposals")
    .update({ status, reviewed_by: user.id })
    .eq("id", id);

  // If approved, award points
  if (status === "approved") {
    const { data: proposal } = await supabase
      .from("challenge_proposals")
      .select("proposed_by")
      .eq("id", id)
      .single();

    if (proposal) {
      await supabase.from("point_logs").insert({
        user_id: proposal.proposed_by,
        points: 20,
        reason: "proposal_accepted",
        reference_id: id,
      });
    }
  }

  revalidatePath("/admin/proposals");
}

export default async function AdminProposalsPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("challenge_proposals")
    .select(`
      *,
      proposer:users!proposed_by(username, display_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">문제 제안 관리</h2>
      <div className="space-y-4">
        {proposals?.map((p) => (
          <div key={p.id} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-xs text-gray-500">
                  by {(p.proposer as any)?.display_name ?? (p.proposer as any)?.username} &middot;{" "}
                  {new Date(p.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                p.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                p.status === "approved" ? "bg-green-500/10 text-green-400" :
                "bg-red-500/10 text-red-400"
              }`}>{p.status}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{p.description}</p>
            {p.real_world_context ? (
              <p className="text-sm text-gray-500 mb-3">실무 맥락: {p.real_world_context}</p>
            ) : null}
            {p.status === "pending" ? (
              <div className="flex gap-2">
                <form action={updateProposalStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg">승인</button>
                </form>
                <form action={updateProposalStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg">반려</button>
                </form>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Commit**

```bash
cd /Users/cozac/Code/thenocodes
git add src/app/admin/
git commit -m "feat: add admin dashboard with challenge management and proposal review"
```

---

## Task 15: Final Build Verification & Deploy Config

**Files:**
- Verify: all existing files compile
- Create: `vercel.json` (if needed)

**Step 1: Run full build**

```bash
cd /Users/cozac/Code/thenocodes
npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run lint**

```bash
cd /Users/cozac/Code/thenocodes
npm run lint
```

Expected: No lint errors, or fix any that appear.

**Step 3: Final commit**

```bash
cd /Users/cozac/Code/thenocodes
git add -A
git commit -m "chore: verify build and prepare for deployment"
```

**Step 4: Deploy checklist (manual)**

- [ ] Create Supabase project at supabase.com
- [ ] Run migration: `npx supabase db push`
- [ ] Enable GitHub and Google auth providers in Supabase dashboard
- [ ] Set environment variables in Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Point thenocodes.org DNS (Cloudflare) to Vercel
- [ ] Set self as admin: `UPDATE public.users SET role = 'admin' WHERE username = 'cozac'`
- [ ] Set 송규선 as admin too

---

## Summary

| Task | Description | Commits |
|------|-------------|---------|
| 1 | Project scaffolding | 1 |
| 2 | Supabase client setup | 1 |
| 3 | Database schema + RLS | 1 |
| 4 | Types + data access | 1 |
| 5 | Auth (OAuth + protected) | 1 |
| 6 | Layout + navigation | 1 |
| 7 | Landing page | 1 |
| 8 | Challenges list | 1 |
| 9 | Challenge detail + submit/vote | 1 |
| 10 | Leaderboard | 1 |
| 11 | Blog pages | 1 |
| 12 | Challenge proposals | 1 |
| 13 | About page | 1 |
| 14 | Admin dashboard | 1 |
| 15 | Build verify + deploy | 1 |

**Total: 15 tasks, ~15 commits, estimated 2-4 hours with agent execution**
