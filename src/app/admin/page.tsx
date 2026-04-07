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
      <h2 className="text-2xl font-bold text-[#3F3F46] mb-6">대시보드</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <p className="text-3xl font-bold text-[#3F3F46]">{stat.value}</p>
            <p className="text-sm text-[#71717A] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
