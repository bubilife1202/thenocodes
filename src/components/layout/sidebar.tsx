"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/contests", label: "공모전" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `block px-3 py-2 text-[13px] rounded-lg transition-colors ${
      isActive(href)
        ? "bg-gray-100 text-black font-bold"
        : "text-[#52525B] hover:bg-gray-50 hover:text-black"
    }`;

  const sidebar = (
    <div className="flex flex-col h-full p-4">
      <Link href="/" className="text-[15px] font-black tracking-tight mb-8 px-3" onClick={() => setOpen(false)}>
        THE NOCODES<span className="text-[#14B8A6]">.</span>
      </Link>

      <nav className="flex flex-col gap-0.5 mb-8">
        <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest px-3 mb-2">탐색</p>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Community CTA */}
      <div className="px-3 py-4 bg-gray-50 rounded-xl">
        <p className="text-[11px] font-bold text-[#52525B] mb-1">커뮤니티</p>
        <p className="text-[11px] text-[#A1A1AA] leading-relaxed mb-3">
          팀 모집, 후기 공유 등 커뮤니티 기능을 준비하고 있습니다.
        </p>
        <a
          href="https://open.kakao.com/o/gExample"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 text-center text-[11px] font-bold bg-[#FEE500] text-[#3C1E1E] rounded-lg hover:brightness-95 transition-all"
        >
          오픈채팅 참여하기
        </a>
      </div>

      <div className="mt-auto pt-6 px-3 text-[10px] text-[#A1A1AA]">
        데이터 매일 자동 수집
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-1.5 rounded-lg bg-white border border-gray-100 shadow-sm"
        aria-label="메뉴"
      >
        <svg className="w-5 h-5 text-[#52525B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-56 bg-white border-r border-gray-100 z-40 overflow-y-auto
          transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebar}
      </aside>
    </>
  );
}
