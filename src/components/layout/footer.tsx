import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-4xl px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <p className="font-black text-[15px] mb-1">
              더노코즈<span className="text-[#14B8A6]">.</span>
            </p>
            <p className="text-sm text-[#71717A]">AI와 노코드로 만드는 사람들의 커뮤니티</p>
          </div>
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <Link href="/hackathons" className="text-[#71717A] hover:text-black transition-colors">해커톤</Link>
              <Link href="/contests" className="text-[#71717A] hover:text-black transition-colors">공모전</Link>
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://open.kakao.com/o/gExample" target="_blank" rel="noopener noreferrer" className="text-[#71717A] hover:text-black transition-colors">카카오 오픈채팅</a>
              <a href="mailto:hello@thenocodes.org" className="text-[#71717A] hover:text-black transition-colors">문의하기</a>
            </div>
          </div>
        </div>
        <p className="mt-8 pt-6 border-t border-gray-100 text-[12px] text-[#A1A1AA]">
          &copy; {new Date().getFullYear()} 더노코즈. 데이터는 매일 자동 수집됩니다.
        </p>
      </div>
    </footer>
  );
}
