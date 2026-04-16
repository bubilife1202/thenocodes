"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "community_comment_likes";

function getLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addLikedId(id: string) {
  const ids = getLikedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function CommentLikeButton({ commentId, initialCount }: { commentId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(getLikedIds().includes(commentId));
  }, [commentId]);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    setCount((c) => c + 1);
    setLiked(true);
    addLikedId(commentId);

    try {
      const res = await fetch("/api/community/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId }),
      });
      if (!res.ok) {
        setCount((c) => c - 1);
        if (res.status !== 409) setLiked(false);
      }
    } catch {
      setCount((c) => c - 1);
      setLiked(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked}
      className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
        liked ? "text-[#E11D48]" : "text-[#A1A1AA] hover:text-[#E11D48]"
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
