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
        <div key={user.id} className="flex items-center gap-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
          <span className="text-lg font-bold text-gray-600 w-8 text-center">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.display_name ?? user.username}</p>
          </div>
          <span className="text-sm font-semibold text-indigo-400">{user.total_points} pts</span>
        </div>
      ))}
      <Link href="/leaderboard" className="block text-center text-sm text-gray-500 hover:text-indigo-400 transition-colors pt-2">
        전체 리더보드 보기 &rarr;
      </Link>
    </div>
  );
}
