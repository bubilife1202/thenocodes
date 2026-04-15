"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "community_votes";

function getVotedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addVotedId(id: string) {
  const ids = getVotedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function VoteButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
    setVoted(getVotedIds().includes(postId));
  }, [initialCount, postId]);

  async function handleVote() {
    if (voted || loading) return;

    setLoading(true);
    setCount((current) => current + 1);

    try {
      const res = await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { vote_count?: number | null } | null;
        if (typeof data?.vote_count === "number") {
          setCount(data.vote_count);
        }
        setVoted(true);
        addVotedId(postId);
        return;
      }

      setCount((current) => current - 1);
      if (res.status === 409) {
        setVoted(true);
        addVotedId(postId);
        return;
      }

      setVoted(false);
    } catch {
      setCount((current) => current - 1);
      setVoted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={voted || loading}
      className={`flex flex-col items-center gap-0.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
        voted
          ? "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]"
          : "border-[#ECE7DF] bg-white text-[#A1A1AA] hover:border-[#D9EFEA] hover:text-[#0F766E]"
      } ${loading ? "cursor-wait" : ""}`}
      aria-label={voted ? "이미 추천한 글" : "이 글 추천하기"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5l0 14" />
        <path d="M18 11l-6 -6l-6 6" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
