import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "점수는 이렇게 모아 - The Nocodes",
  description: "포인트 시스템 안내",
};

const REWARDS = [
  { action: "풀이 제출", desc: "문제 하나 풀면", pts: "+10", color: "text-[#14B8A6]" },
  { action: "투표 받기", desc: "누가 내 풀이에 좋다고 하면", pts: "+2", color: "text-purple-500" },
  { action: "문제 채택", desc: "내가 낸 문제가 뽑히면", pts: "+20", color: "text-pink-500" },
  { action: "우수 풀이", desc: "Featured로 올라가면", pts: "+50", color: "text-amber-500" },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#3F3F46] mb-2">점수는 이렇게 모아</h1>
      <p className="text-[#71717A] mb-10">당신의 몸값, 숫자로 증명할 준비 되셨습니까?</p>

      <div className="divide-y divide-gray-200 mb-12">
        {REWARDS.map((item) => (
          <div key={item.action} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-5">
            <div className="min-w-0">
              <span className="text-[#3F3F46] font-medium">{item.action}</span>
              <span className="block sm:inline text-[#71717A] text-sm sm:ml-2">{item.desc}</span>
            </div>
            <span className={`text-2xl font-black shrink-0 tabular-nums ${item.color}`}>{item.pts}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-[#3F3F46] mb-4">점수가 쌓이면</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50">
          <div className="text-lg font-semibold text-[#3F3F46] mb-2">리더보드 랭킹</div>
          <p className="text-sm text-[#71717A]">TOP 10은 프로필에 배지. 실력을 증명하세요.</p>
        </div>
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50">
          <div className="text-lg font-semibold text-[#3F3F46] mb-2">월간 리워드</div>
          <p className="text-sm text-[#71717A]">매월 상위 랭커에게 특별 리워드 지급.</p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/challenges" className="px-6 py-3 bg-[#3F3F46] hover:bg-[#27272A] text-white font-bold rounded-lg transition-colors">
          문제 풀러 가기
        </Link>
      </div>
    </div>
  );
}
