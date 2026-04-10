import Link from "next/link";
import { ChallengeCard } from "@/components/challenge-card";
import { getChallenges, type ChallengeKind } from "@/lib/data/challenges";

export const revalidate = 300;

const tabs: { label: string; value?: ChallengeKind }[] = [
  { label: "전체" },
  { label: "추론", value: "reasoning" },
  { label: "코딩", value: "coding" },
  { label: "수학", value: "math" },
  { label: "벤치마크", value: "benchmark" },
];

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const currentKind = (params.kind as ChallengeKind | undefined) ?? undefined;
  const items = getChallenges(currentKind);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-black tracking-tight">AI로 딴짓</h1>
        <p className="text-sm text-[#71717A]">
          심심할 때 AI 붙여보면 재밌는 사이트들. 너무 거창하지 않고, 그냥 눌러보면 된다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/challenges?kind=${tab.value}` : "/challenges"}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              currentKind === tab.value
                ? "bg-[#18181B] text-white"
                : "bg-gray-100 text-[#71717A] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#ECE7DF] bg-white p-8 text-center text-[#A1A1AA]">
          <p className="mb-1 font-bold">해당 타입의 딴짓거리가 아직 없습니다</p>
          <p className="text-sm">다른 유형을 눌러보세요.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <ChallengeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
