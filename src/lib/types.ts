export type UserRole = "user" | "admin";

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
