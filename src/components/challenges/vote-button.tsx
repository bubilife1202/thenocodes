"use client";

import { toggleVote } from "@/lib/actions/votes";
import { useState } from "react";

export function VoteButton({
  submissionId,
  voteCount,
  hasVoted,
  isLoggedIn,
}: {
  submissionId: string;
  voteCount: number;
  hasVoted: boolean;
  isLoggedIn: boolean;
}) {
  const [optimisticVoteCount, setOptimisticVoteCount] = useState(voteCount);
  const [optimisticHasVoted, setOptimisticHasVoted] = useState(hasVoted);

  async function handleVote() {
    if (!isLoggedIn) return;
    
    // Optimistic UI
    setOptimisticHasVoted(!optimisticHasVoted);
    setOptimisticVoteCount(optimisticHasVoted ? optimisticVoteCount - 1 : optimisticVoteCount + 1);

    try {
      await toggleVote(submissionId);
    } catch (error) {
      // Revert if error
      setOptimisticHasVoted(optimisticHasVoted);
      setOptimisticVoteCount(optimisticVoteCount);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={!isLoggedIn}
      className={`flex flex-col items-center gap-1 group px-3 py-4 rounded-2xl transition-all border ${
        optimisticHasVoted
          ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#0F766E]"
          : "bg-white border-gray-100 text-[#71717A] hover:bg-gray-50 hover:border-gray-200"
      } ${!isLoggedIn ? "opacity-40 cursor-not-allowed grayscale" : ""}`}
      title={isLoggedIn ? (optimisticHasVoted ? "공감 취소" : "멋진 아이디어예요!") : "로그인 후 공감할 수 있어요"}
    >
      <span className={`text-xl transition-transform group-hover:scale-125 group-active:scale-90 ${
        optimisticHasVoted ? "animate-bounce" : ""
      }`}>
        {optimisticHasVoted ? "💖" : "✨"}
      </span>
      <span className="text-xs font-black tracking-widest tabular-nums">
        {optimisticVoteCount}
      </span>
    </button>
  );
}
