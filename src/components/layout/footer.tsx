import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-lg font-bold text-white">The Nocodes</p>
            <p className="text-sm text-gray-500 mt-1">AI 시대, 실무 문제를 풀며 성장하세요</p>
          </div>
          <div className="flex gap-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">플랫폼</p>
              <Link href="/challenges" className="block text-sm text-gray-500 hover:text-gray-300">챌린지</Link>
              <Link href="/leaderboard" className="block text-sm text-gray-500 hover:text-gray-300">리더보드</Link>
              <Link href="/blog" className="block text-sm text-gray-500 hover:text-gray-300">블로그</Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">정보</p>
              <Link href="/about" className="block text-sm text-gray-500 hover:text-gray-300">소개</Link>
              <Link href="/challenges/propose" className="block text-sm text-gray-500 hover:text-gray-300">문제 제안</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} The Nocodes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
