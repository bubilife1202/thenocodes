"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavTone = "teal" | "orange" | "neutral";

type NavItem = {
  label: string;
  href?: string;
  badge?: string;
  tone?: NavTone;
  description?: string;
};

const MAIN_ITEMS: NavItem[] = [
  { label: "홈", href: "/", tone: "neutral", description: "더노코즈 메인" },
  { label: "해커톤", href: "/hackathons", tone: "teal", description: "AI · 데이터 · 노코드" },
  { label: "공모전", href: "/contests", tone: "orange", description: "경진대회 · 아이디어 공모" },
  { label: "밋업 / 세미나", href: "/meetups", tone: "teal", description: "서울 AI 오프라인 행사" },
  { label: "흐름", href: "/signals", tone: "neutral", description: "빌더가 챙겨야 할 변화" },
];

const COMMUNITY_ITEMS: NavItem[] = [
  { label: "피드백 보드", href: "/feedback", tone: "neutral", description: "대기중 · 진행중 · 완료" },
];

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  // Hash links (/#...) are never "active" — only the plain "/" home link is
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}?`);
}

function accentBar(tone: NavTone = "neutral") {
  if (tone === "teal") return "bg-[#0F766E]";
  if (tone === "orange") return "bg-[#C46A1A]";
  return "bg-[#B8B1A8]";
}

function rowClasses(active: boolean) {
  return active
    ? "bg-[#F7F4EE] text-[#18181B]"
    : "text-[#5F5951] hover:bg-[#F8F5F0] hover:text-[#18181B]";
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D7D0C7]" />
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">{title}</p>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const tone = item.tone ?? "neutral";
          const inner = (
            <>
              <span className={`absolute left-0 top-1/2 h-[70%] w-[3px] -translate-y-1/2 rounded-r-full ${accentBar(tone)} ${active ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
              <div className="min-w-0 pl-3 pr-2">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                {item.description && (
                  <p className="mt-0.5 truncate text-[11px] text-[#938B81]">{item.description}</p>
                )}
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-2 pr-2">
                {item.badge && (
                  <span className="rounded-full border border-[#E7E0D7] bg-white px-2 py-0.5 text-[10px] font-bold text-[#8A8278]">
                    {item.badge}
                  </span>
                )}
              </div>
            </>
          );

          const className = `group relative flex items-center justify-between overflow-hidden rounded-xl border border-transparent py-2.5 transition-colors ${rowClasses(active)}`;

          if (!item.href) {
            return (
              <div key={item.label} className={className}>
                {inner}
              </div>
            );
          }

          return (
            <Link key={item.label} href={item.href} onClick={onNavigate} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SidebarBody({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col overflow-y-auto rounded-[24px] border border-[#ECE7DF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBF8_60%,#FAF7F2_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(24,24,27,0.28)]">
      <div className="rounded-2xl border border-[#E9E2D8] bg-white/90 px-4 py-4">
        <Link href="/" onClick={onNavigate} className="text-base font-black tracking-tight text-[#18181B]">
          더노코즈<span className="text-[#14B8A6]">.</span>
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-[#71717A]">
          해커톤, 공모전, AI 밋업을 매일 자동으로 모아둡니다.
        </p>
      </div>

      <div className="mt-5 space-y-6">
        <NavSection title="탐색" items={MAIN_ITEMS} pathname={pathname} onNavigate={onNavigate} />
        <NavSection title="커뮤니티" items={COMMUNITY_ITEMS} pathname={pathname} onNavigate={onNavigate} />
      </div>

      <div className="mt-auto rounded-[20px] border border-[#D9EFEA] bg-[linear-gradient(180deg,#F6FCFB_0%,#EEF8F6_100%)] p-4">
        <p className="text-sm font-bold text-[#123B38]">카카오 오픈채팅</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#5C7D78]">제보 · 운영 의견은 여기서 바로 받아요.</p>
        <a
          href="https://open.kakao.com/o/pSpn5mpi"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
        >
          오픈채팅 들어가기
        </a>
      </div>
    </div>
  );
}

export function SiteNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#ECE7DF] bg-[#FCFBF8]/92 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-black tracking-tight text-[#18181B]">
            더노코즈<span className="text-[#14B8A6]">.</span>
          </Link>
          <button
            type="button"
            aria-label="메뉴 열기"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6DED4] bg-white text-[#6B6760] shadow-[0_10px_22px_-18px_rgba(24,24,27,0.22)] transition-colors hover:bg-[#FAF7F2]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      <aside className="hidden border-r border-[#ECE7DF] bg-[#FCFBF8] lg:sticky lg:top-0 lg:block lg:self-start">
        <div className="h-screen px-4 py-4">
          <SidebarBody pathname={pathname} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-[rgba(24,24,27,0.28)] backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[340px] bg-transparent px-3 py-3">
            <div className="h-full rounded-[28px] bg-[#FCFBF8] shadow-[0_18px_40px_-24px_rgba(24,24,27,0.35)]">
              <div className="flex items-center justify-between px-4 pt-4">
                <Link href="/" onClick={() => setOpen(false)} className="text-base font-black tracking-tight text-[#18181B]">
                  더노코즈<span className="text-[#14B8A6]">.</span>
                </Link>
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E6DED4] bg-white text-[#6B6760]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="h-[calc(100%-64px)] px-4 pb-4">
                <SidebarBody pathname={pathname} onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
