import { Suspense } from "react";
import Link from "next/link";
import { getHackathons } from "@/lib/data/hackathons";
import { type HackathonStatus } from "@/lib/hackathons";
import { EventCard } from "@/components/event-card";

export const revalidate = 300;

async function HackathonList({ filter }: { filter?: HackathonStatus }) {
  const hackathons = await getHackathons(filter);

  if (hackathons.length === 0) {
    return (
      <div className="text-center py-16 text-[#A1A1AA]">
        <p className="font-bold mb-1">해커톤이 없습니다</p>
        <p className="text-sm">매일 자동으로 업데이트됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hackathons.map((h) => (
        <EventCard key={h.id} item={h} accent="teal" showTags />
      ))}
    </div>
  );
}

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "진행중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="max-w-4xl px-6 pt-10 pb-16 pl-14 lg:pl-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">해커톤</h1>
        <p className="text-sm text-[#71717A]">
          AI · 데이터 · 노코드 해커톤 공고를 매일 자동으로 수집합니다
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/hackathons?status=${tab.value}` : "/hackathons"}
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
        <HackathonList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
