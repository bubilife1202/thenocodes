export const metadata = {
  title: "소개 - The Nocodes",
  description: "The Nocodes 커뮤니티 소개",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">The Nocodes</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-3">비전</h2>
        <p className="text-gray-300 leading-relaxed">
          AI 시대에 실무 문제를 풀며 성장하는 커뮤니티 플랫폼입니다.
          비개발자와 주니어 개발자 모두가 AI를 활용해 실제 업무에서 만나는
          문제를 해결하고, 함께 성장할 수 있는 공간을 만들고 있습니다.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-3">무엇을 할 수 있나요?</h2>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">🏆</span>
            <span>주간/격주 챌린지에 참여하여 실무 문제를 풀어보세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">💡</span>
            <span>직접 문제를 제안하고, 채택되면 포인트를 받으세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">📊</span>
            <span>리더보드에서 실력을 인정받고, 채용 기회를 얻으세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">📰</span>
            <span>AI 활용 팁과 최신 트렌드를 블로그에서 확인하세요</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">운영진</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="font-semibold text-white text-lg">코작 (Cozac)</p>
            <p className="text-sm text-indigo-400 mb-2">Co-Founder & Tech Lead</p>
            <p className="text-sm text-gray-400">기술/개발 메인, 챌린지 기획</p>
          </div>
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="font-semibold text-white text-lg">송규선</p>
            <p className="text-sm text-indigo-400 mb-2">Co-Founder & Operations</p>
            <p className="text-sm text-gray-400">개발 서포트, 챌린지 기획, 커뮤니티 관리</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">참여 방법</h2>
        <div className="space-y-4 text-gray-300">
          <p>1. GitHub 또는 Google 계정으로 로그인하세요</p>
          <p>2. 진행 중인 챌린지를 확인하고 풀이를 제출하세요</p>
          <p>3. 다른 참여자의 풀이에 투표하세요</p>
          <p>4. 좋은 문제가 있다면 직접 제안해보세요</p>
        </div>
      </section>
    </div>
  );
}
