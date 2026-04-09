import Link from "next/link";

const PRIMARY_LINKS = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/contests", label: "공모전" },
  { href: "/meetups", label: "밋업 / 세미나" },
  { href: "/feedback", label: "피드백 보드" },
];

const SECONDARY_LINKS = [
  { href: "https://open.kakao.com/o/pSpn5mpi", label: "카카오 오픈채팅", external: true },
  { href: "mailto:hello@thenocodes.org", label: "문의하기", external: true },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#ECE7DF] bg-[#FCFBF8]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="mb-2 text-[15px] font-black text-[#18181B]">
              더노코즈<span className="text-[#14B8A6]">.</span>
            </p>
            <p className="text-sm leading-relaxed text-[#71717A]">
              한국 AI 해커톤, 공모전, 밋업을 매일 자동으로 모아둡니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#6B6760] transition-colors hover:text-black"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
              {SECONDARY_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-[#8A8278] transition-colors hover:text-black"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[#ECE7DF] pt-4 text-[12px] text-[#A1A1AA]">
          © {new Date().getFullYear()} 더노코즈
        </div>
      </div>
    </footer>
  );
}
