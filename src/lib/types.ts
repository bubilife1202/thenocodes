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
