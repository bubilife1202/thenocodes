import { Suspense } from "react";
import Link from "next/link";
import { type HackathonStatus } from "@/lib/hackathons";
import { EventCard } from "@/components/event-card";
import { getMeetups } from "@/lib/data/meetups";

export const revalidate = 300;

async function MeetupList({ filter }: { filter?: HackathonStatus }) {
  const meetups = await getMeetups(filter);

  if (meetups.length === 0) {
    return (
      <div className="py-16 text-center text-[#A1A1AA]">
        <p className="mb-1 font-bold">서울 AI 밋업/세미나가 없습니다</p>
        <p className="text-sm">새로운 Luma 행사 확인 후 추가됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {meetups.map((item) => (
        <EventCard key={item.id} item={item} accent="teal" showTags />
      ))}
    </div>
  );
}

export default async function MeetupsPage({
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-black tracking-tight">밋업 / 세미나</h1>
        <p className="text-sm text-[#71717A]">
          Luma에서 확인한 서울 AI 관련 밋업과 세미나를 선별해서 모아둡니다
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/meetups?status=${tab.value}` : "/meetups"}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
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
            {[1, 2].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        }
      >
        <MeetupList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
