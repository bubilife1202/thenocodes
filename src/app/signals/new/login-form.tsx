"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/signals/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "비밀번호가 맞지 않습니다.");
    }
    setLoading(false);
  }

  return (
    <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,118,110,0.25)] sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0F766E]">Admin Access</p>
        <h2 className="text-2xl font-black tracking-tight text-[#18181B]">흐름 작성 잠금 해제</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6760]">
          관리자 비밀번호를 입력하면 작성 폼이 표시됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#18181B]">비밀번호</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3 text-sm text-[#18181B] outline-none transition-colors placeholder:text-[#B0AAA2] focus:border-[#0F766E] focus:bg-white"
            placeholder="관리자 비밀번호"
          />
        </label>

        {error && (
          <p className="rounded-2xl border border-[#F3DDC3] bg-[#FFF7EF] px-4 py-3 text-sm text-[#9A5A19]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "확인 중..." : "관리자 인증"}
        </button>
      </form>
    </section>
  );
}
