import { getCurrentUser } from "@/lib/data/users";
import { createProposal } from "@/lib/actions/proposals";
import { redirect } from "next/navigation";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export const metadata = {
  title: "문제 제안 - The Nocodes",
  description: "AI 실무 챌린지 문제를 제안해주세요",
};

export default async function ProposePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">문제 제안</h1>
      <p className="text-gray-400 mb-8">
        실무에서 만났던 문제, AI로 풀면 좋을 과제를 제안해주세요.
        채택되면 +20 포인트!
      </p>

      <form action={createProposal} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            제목
          </label>
          <input
            name="title"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="챌린지 문제 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            문제 설명
          </label>
          <textarea
            name="description"
            required
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="문제를 상세히 설명해주세요. 배경, 요구사항, 예상 결과물 등"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              카테고리
            </label>
            <select
              name="category"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              난이도 제안
            </label>
            <select
              name="difficulty"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            실무 활용 사례 (선택)
          </label>
          <textarea
            name="real_world_context"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            placeholder="이 문제가 실무에서 어떻게 활용될 수 있는지 설명해주세요"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          문제 제안하기
        </button>
      </form>
    </div>
  );
}
