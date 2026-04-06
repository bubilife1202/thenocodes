"use client";

import { toggleVote } from "@/lib/actions/votes";

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
  return (
    <form action={() => toggleVote(submissionId)}>
      <button
        type="submit"
        disabled={!isLoggedIn}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          hasVoted
            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
        } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isLoggedIn ? (hasVoted ? "투표 취소" : "투표하기") : "로그인 필요"}
      >
        <span>{hasVoted ? "▲" : "△"}</span>
        <span>{voteCount}</span>
      </button>
    </form>
  );
}
