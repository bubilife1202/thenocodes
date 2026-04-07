"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-4xl px-6 pt-20 pb-16 pl-14 lg:pl-6 text-center">
      <h2 className="text-xl font-bold mb-2">문제가 발생했습니다</h2>
      <p className="text-sm text-[#71717A] mb-6">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-semibold bg-[#18181B] text-white rounded-lg hover:bg-[#27272A] transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
