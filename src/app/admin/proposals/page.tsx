import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateProposalStatus(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabase
    .from("challenge_proposals")
    .update({ status, reviewed_by: user.id })
    .eq("id", id);

  // If approved, award points
  if (status === "approved") {
    const { data: proposal } = await supabase
      .from("challenge_proposals")
      .select("proposed_by")
      .eq("id", id)
      .single();

    if (proposal) {
      await supabase.from("point_logs").insert({
        user_id: proposal.proposed_by,
        points: 20,
        reason: "proposal_accepted",
        reference_id: id,
      });
    }
  }

  revalidatePath("/admin/proposals");
}

export default async function AdminProposalsPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("challenge_proposals")
    .select(`
      *,
      proposer:users!proposed_by(username, display_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">문제 제안 관리</h2>
      <div className="space-y-4">
        {proposals?.map((p) => (
          <div key={p.id} className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-xs text-gray-500">
                  by {(p.proposer as any)?.display_name ?? (p.proposer as any)?.username} &middot;{" "}
                  {new Date(p.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                p.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                p.status === "approved" ? "bg-green-500/10 text-green-400" :
                "bg-red-500/10 text-red-400"
              }`}>{p.status}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{p.description}</p>
            {p.real_world_context ? (
              <p className="text-sm text-gray-500 mb-3">실무 맥락: {p.real_world_context}</p>
            ) : null}
            {p.status === "pending" ? (
              <div className="flex gap-2">
                <form action={updateProposalStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg">승인</button>
                </form>
                <form action={updateProposalStatus}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg">반려</button>
                </form>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
