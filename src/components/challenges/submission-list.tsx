import { getSubmissionsByChallenge } from "@/lib/data/submissions";
import { VoteButton } from "./vote-button";
import { createClient } from "@/lib/supabase/server";

export async function SubmissionList({ challengeId }: { challengeId: string }) {
  const [submissions, supabase] = await Promise.all([
    getSubmissionsByChallenge(challengeId),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Get user's votes for these submissions
  let userVotes: Set<string> = new Set();
  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("submission_id")
      .eq("user_id", user.id)
      .in("submission_id", submissions.map((s) => s.id));
    userVotes = new Set(votes?.map((v) => v.submission_id) ?? []);
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 제출된 풀이가 없습니다. 첫 번째로 풀이를 제출해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className={`p-5 bg-gray-900/50 border rounded-xl ${
            submission.is_featured
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-gray-800"
          }`}
        >
          <div className="flex items-start gap-4">
            <VoteButton
              submissionId={submission.id}
              voteCount={submission.vote_count}
              hasVoted={userVotes.has(submission.id)}
              isLoggedIn={isLoggedIn}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-white">
                  {submission.user?.display_name ?? submission.user?.username ?? "익명"}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(submission.created_at).toLocaleDateString("ko-KR")}
                </span>
                {submission.is_featured ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    우수 풀이
                  </span>
                ) : null}
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{submission.content}</p>
              {submission.link_url ? (
                <a
                  href={submission.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  {submission.link_url} &rarr;
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
