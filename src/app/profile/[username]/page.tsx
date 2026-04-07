import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/users";
import { AdSlot } from "@/components/ads/ad-slot";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} - The Nocodes` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) notFound();

  // Get user's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, challenges(title, category)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get rank
  const { data: allUsers } = await supabase
    .from("users")
    .select("id")
    .order("total_points", { ascending: false });

  const rank = (allUsers?.findIndex((u) => u.id === user.id) ?? -1) + 1;
  const isOwner = currentUser?.id === user.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#34D399] flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {(user.display_name ?? user.username).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#3F3F46] truncate">{user.display_name ?? user.username}</h1>
            {rank > 0 && rank <= 50 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                TOP {rank}
              </span>
            )}
            {isOwner && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-600">YOU</span>
            )}
          </div>
          {user.bio && <p className="text-[#71717A] text-sm mb-4">{user.bio}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-[#3F3F46]">{user.total_points}</div>
              <div className="text-xs text-[#71717A]">총 포인트</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3F3F46]">{submissions?.length ?? 0}</div>
              <div className="text-xs text-[#71717A]">제출한 풀이</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3F3F46]">
                {submissions?.reduce((sum, s) => sum + (s.vote_count ?? 0), 0) ?? 0}
              </div>
              <div className="text-xs text-[#71717A]">받은 투표</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#3F3F46]">{rank > 0 ? `#${rank}` : "-"}</div>
              <div className="text-xs text-[#71717A]">현재 순위</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
        {/* Submissions */}
        <div>
          <h2 className="text-lg font-bold text-[#3F3F46] mb-4">제출한 풀이</h2>
          <div className="space-y-3">
            {submissions?.map((sub) => (
              <a
                key={sub.id}
                href={`/challenges/${(sub.challenges as { title: string; category: string })?.title ?? ""}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#3F3F46] font-medium">
                      {(sub.challenges as { title: string; category: string })?.title ?? "챌린지"}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">
                      {new Date(sub.created_at).toLocaleDateString("ko-KR")} · 투표 {sub.vote_count}개
                      {sub.is_featured && <span className="text-amber-500 ml-1">· Featured</span>}
                    </p>
                  </div>
                  <span className="text-[#14B8A6] font-semibold text-sm">
                    +{10 + sub.vote_count * 2}{sub.is_featured ? "+50" : ""}pts
                  </span>
                </div>
              </a>
            ))}
            {(!submissions || submissions.length === 0) && (
              <div className="text-center py-8 text-[#71717A]">
                아직 제출한 풀이가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden md:block space-y-4">
          <AdSlot slot="leaderboard-sidebar" />
        </div>
      </div>
    </div>
  );
}
