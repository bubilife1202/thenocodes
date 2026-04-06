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
