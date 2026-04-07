"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/contests", label: "공모전" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `block px-3 py-2.5 text-sm rounded-lg transition-colors ${
      isActive(href)
        ? "bg-gray-100 text-black font-bold"
        : "text-[#52525B] hover:bg-gray-50 hover:text-black"
    }`;

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="sidebar-nav"
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-[#52525B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
        <Link href="/" className="text-sm font-black tracking-tight" onClick={close}>
          더노코즈<span className="text-[#14B8A6]">.</span>
        </Link>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        role="navigation"
        aria-label="사이트 네비게이션"
        className={`fixed top-0 left-0 bottom-0 w-56 bg-white border-r border-gray-100 z-40 overflow-y-auto
          transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-4">
          <Link href="/" className="text-[15px] font-black tracking-tight mb-8 px-3 hidden lg:block" onClick={close}>
            더노코즈<span className="text-[#14B8A6]">.</span>
          </Link>

          {/* Spacer for mobile header */}
          <div className="h-10 lg:hidden" />

          <nav className="flex flex-col gap-0.5 mb-8" aria-label="주요 메뉴">
            <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest px-3 mb-2">탐색</p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                onClick={close}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Community CTA */}
          <div className="px-3 py-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-[#52525B] mb-1">커뮤니티</p>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
              팀 모집, 후기 공유 등 커뮤니티 기능을 준비하고 있습니다.
            </p>
            <a
              href="https://open.kakao.com/o/gExample"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 text-center text-xs font-bold bg-[#FEE500] text-[#3C1E1E] rounded-lg hover:brightness-95 transition-all"
            >
              오픈채팅 참여하기
            </a>
          </div>

          <p className="mt-auto pt-6 px-3 text-xs text-[#A1A1AA]">
            데이터 매일 자동 수집
          </p>
        </div>
      </aside>
    </>
  );
}
