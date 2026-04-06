import Link from "next/link";

export function Hero() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
          AI 시대의 실무 챌린지 플랫폼
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          실무 문제를 풀며
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            함께 성장하세요
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          AI 활용, 데이터 분석, 노코드 빌딩 — 실제 업무에서 만나는 문제들을 풀고,
          커뮤니티와 함께 성장하는 챌린지 플랫폼입니다.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/challenges" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
            챌린지 참여하기
          </Link>
          <Link href="/about" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors">
            더 알아보기
          </Link>
        </div>
      </div>
    </section>
  );
}
