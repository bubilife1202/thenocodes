import { signInWithGitHub, signInWithGoogle } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-[#3F3F46] text-center mb-2">
          The Nocodes 로그인
        </h1>
        <p className="text-[#71717A] text-center mb-8">
          AI 시대, 실무 문제를 풀며 성장하세요
        </p>
        <div className="space-y-3">
          <form action={signInWithGitHub}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-[#3F3F46] rounded-lg border border-gray-200 transition-colors"
            >
              GitHub로 로그인
            </button>
          </form>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-[#3F3F46] rounded-lg border border-gray-200 transition-colors"
            >
              Google로 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
