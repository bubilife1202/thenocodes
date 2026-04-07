import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl flex items-center justify-between h-14 px-6">
        <Link href="/" className="text-[15px] font-black tracking-tight">
          THE NOCODES<span className="text-[#14B8A6]">.</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/hackathons"
            className="text-[13px] font-semibold text-[#52525B] hover:text-black transition-colors"
          >
            해커톤
          </Link>
          <Link
            href="/contests"
            className="text-[13px] font-semibold text-[#52525B] hover:text-black transition-colors"
          >
            공모전
          </Link>
        </nav>
      </div>
    </header>
  );
}
