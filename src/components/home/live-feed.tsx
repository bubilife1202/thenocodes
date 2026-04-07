import { getRecentActivity } from "@/lib/data/activity";

export async function LiveFeed() {
  const activities = await getRecentActivity(4);

  if (activities.length === 0) {
    return (
      <div className="py-8 px-4 border border-dashed border-black/[0.05] rounded-xl text-center">
        <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 group">
          <div className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${
            activity.type === "submission" ? "bg-[#14B8A6]" : "bg-[#71717A]"
          }`} />
          <div className="min-w-0">
            <p className="text-[12px] leading-snug text-[#52525B]">
              <span className="text-[#18181B] font-bold">{activity.user_name}</span>님이{" "}
              <span className="text-[#18181B] font-medium">'{activity.challenge_title}'</span>{" "}
              {activity.type === "submission" ? "챌린지를 해결했습니다." : "풀이에 투표했습니다."}
            </p>
            <span className="text-[10px] text-[#A1A1AA] font-medium mt-1 inline-block">
              {new Date(activity.created_at).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
