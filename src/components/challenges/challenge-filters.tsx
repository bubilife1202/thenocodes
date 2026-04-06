"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ChallengeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "all";

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`/challenges?${params.toString()}`);
  }

  const statuses = [
    { value: "all", label: "전체" },
    { value: "active", label: "진행 중" },
    { value: "closed", label: "마감" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleStatusChange(s.value)}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            currentStatus === s.value
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
