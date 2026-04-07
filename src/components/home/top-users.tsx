import { getTopUsers } from "@/lib/data/users";
import Link from "next/link";

export async function TopUsers() {
  const users = await getTopUsers(4);

  if (users.length === 0) {
    return (
      <div className="py-8 px-4 border border-dashed border-black/[0.05] rounded-xl text-center">
        <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Waiting for solvers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user, i) => (
        <div
          key={user.id}
          className="flex items-center gap-4 group"
        >
          <div className="w-7 h-7 rounded-full bg-gray-50 border border-black/[0.05] flex items-center justify-center text-[11px] font-bold text-[#71717A]">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#18181B] group-hover:text-[#14B8A6] transition-colors truncate">
              {user.display_name ?? user.username}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#71717A] tracking-tighter">
            {user.total_points} PTS
          </span>
        </div>
      ))}
      <Link
        href="/leaderboard"
        className="block text-center text-[11px] font-bold text-[#A1A1AA] hover:text-black transition-colors pt-4 border-t border-black/[0.03]"
      >
        전체 보기 &rarr;
      </Link>
    </div>
  );
}
