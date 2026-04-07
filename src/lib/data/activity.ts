import { createClient } from "@/lib/supabase/server";

export interface ActivityItem {
  id: string;
  type: "submission" | "vote";
  user_name: string;
  challenge_title: string;
  created_at: string;
}

export async function getRecentActivity(limit: number = 5): Promise<ActivityItem[]> {
  const supabase = await createClient();

  // 최신 제출과 투표를 각각 가져와서 병합
  const [{ data: submissions }, { data: votes }] = await Promise.all([
    supabase
      .from("submissions")
      .select(`
        id,
        created_at,
        users(display_name, username),
        challenges(title)
      `)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("votes")
      .select(`
        id,
        created_at,
        users(display_name, username),
        submissions(challenges(title))
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
  ]);

  const activity: ActivityItem[] = [];

  submissions?.forEach((s: any) => {
    activity.push({
      id: s.id,
      type: "submission",
      user_name: s.users?.display_name ?? s.users?.username ?? "익명",
      challenge_title: s.challenges?.title ?? "챌린지",
      created_at: s.created_at
    });
  });

  votes?.forEach((v: any) => {
    activity.push({
      id: v.id,
      type: "vote",
      user_name: v.users?.display_name ?? v.users?.username ?? "익명",
      challenge_title: v.submissions?.challenges?.title ?? "챌린지",
      created_at: v.created_at
    });
  });

  // 시간순 정렬 후 리미트 적용
  return activity
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
