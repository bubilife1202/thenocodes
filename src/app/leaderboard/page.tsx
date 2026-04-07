import type { Metadata } from "next";
import { getTopUsers } from "@/lib/data/users";
import { AdSlot } from "@/components/ads/ad-slot";

export const metadata: Metadata = {
  title: "리더보드 - The Nocodes",
  description: "실력이 말해준다",
};

export default async function LeaderboardPage() {
  const users = await getTopUsers(50);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#3F3F46] mb-2">실력이 말해준다</h1>
      <p className="text-[#71717A] mb-8">점수는 거짓말 안 해요.</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-8">
        <div className="divide-y divide-gray-200">
          {users.map((user, i) => (
            <a
              key={user.id}
              href={`/profile/${user.username}`}
              className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 px-2 py-4 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <span className={`text-xl font-black text-center ${
                i === 0 ? "text-yellow-500" :
                i === 1 ? "text-gray-400" :
                i === 2 ? "text-amber-600" :
                "text-[#A1A1AA]"
              }`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-[#3F3F46] truncate">
                  {user.display_name ?? user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-[#71717A] truncate">{user.bio}</p>
                )}
              </div>
              <span className="text-lg font-bold text-[#14B8A6] tabular-nums">
                {user.total_points}
                <span className="text-xs text-[#71717A] ml-1">pts</span>
              </span>
            </a>
          ))}

          {users.length === 0 && (
            <div className="text-center py-16 text-[#71717A]">
              빈집털이 찬스. 지금 제출하면 1위는 따놓은 당상.
            </div>
          )}
        </div>

        <div className="hidden md:block space-y-4 sticky top-20">
          <AdSlot slot="leaderboard-sidebar" />
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-[#3F3F46] mb-3">점수는 이렇게 모아</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#71717A]"><span>풀이 제출</span><span className="font-bold text-[#14B8A6]">+10</span></div>
              <div className="flex justify-between text-[#71717A]"><span>투표 받기</span><span className="font-bold text-purple-500">+2</span></div>
              <div className="flex justify-between text-[#71717A]"><span>문제 채택</span><span className="font-bold text-pink-500">+20</span></div>
              <div className="flex justify-between text-[#71717A]"><span>우수 풀이</span><span className="font-bold text-amber-500">+50</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
