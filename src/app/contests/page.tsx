import { Suspense } from "react";
import Link from "next/link";
import { getContests } from "@/lib/data/hackathons";
import { type HackathonStatus } from "@/lib/hackathons";
import { EventCard } from "@/components/event-card";

export const revalidate = 300;

async function ContestList({ filter }: { filter?: HackathonStatus }) {
  const contests = await getContests(filter);

  if (contests.length === 0) {
    return (
      <div className="text-center py-16 text-[#A1A1AA]">
        <p className="font-bold mb-1">공모전이 없습니다</p>
        <p className="text-sm">새로운 공모전이 등록되면 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contests.map((c) => (
        <EventCard key={c.id} item={c} accent="orange" showTags />
      ))}
    </div>
  );
}

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "모집중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="max-w-4xl px-6 pt-10 pb-16 pl-14 lg:pl-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">공모전</h1>
        <p className="text-sm text-[#71717A]">
          창업 경진대회 · 아이디어 공모전 · 스타트업 대회 정보를 모아봅니다
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/contests?status=${tab.value}` : "/contests"}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentFilter === tab.value
                ? "bg-[#18181B] text-white"
                : "bg-gray-100 text-[#71717A] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-gray-50 rounded-xl h-40" />
            ))}
          </div>
        }
      >
        <ContestList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
