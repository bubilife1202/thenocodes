import { getCurrentUser } from "@/lib/data/users";
import { redirect } from "next/navigation";
import { ProposalForm } from "@/components/challenges/proposal-form";

export const metadata = {
  title: "문제 제안 - The Nocodes",
  description: "AI 실무 챌린지 문제를 제안해주세요",
};

export default async function ProposePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-[#3F3F46] mb-2">문제 제안</h1>
      <p className="text-[#71717A] mb-8">
        실무에서 만났던 문제, AI로 풀면 좋을 과제를 제안해주세요.
        채택되면 +20 포인트!
      </p>

      <ProposalForm />
    </div>
  );
}
