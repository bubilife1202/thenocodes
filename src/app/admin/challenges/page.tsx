import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

async function createChallenge(formData: FormData) {
  "use server";
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/(^-|-$)/g, "");

  await supabase.from("challenges").insert({
    slug,
    title,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    difficulty: formData.get("difficulty") as string,
    status: formData.get("status") as string,
    starts_at: formData.get("starts_at") || null,
    ends_at: formData.get("ends_at") || null,
    created_by: user.id,
    source: formData.get("source") as string,
    company_name: (formData.get("company_name") as string) || null,
  });

  revalidatePath("/admin/challenges");
}

export default async function AdminChallengesPage() {
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">챌린지 관리</h2>

      {/* Create form */}
      <form action={createChallenge} className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
        <h3 className="text-lg font-semibold text-white">새 챌린지</h3>
        <input name="title" required placeholder="제목" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        <textarea name="description" required rows={4} placeholder="설명 (Markdown)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select name="category" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="difficulty" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="status" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <select name="source" required className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
            <option value="admin">Admin</option>
            <option value="community">Community</option>
            <option value="company">Company</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input name="starts_at" type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          <input name="ends_at" type="datetime-local" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          <input name="company_name" placeholder="기업명 (선택)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
        </div>
        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">생성</button>
      </form>

      {/* Challenge list */}
      <div className="space-y-2">
        {challenges?.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">{c.title}</p>
              <p className="text-xs text-gray-500">/{c.slug} &middot; {c.status} &middot; {c.category}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              c.status === "active" ? "bg-green-500/10 text-green-400" :
              c.status === "draft" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-gray-800 text-gray-500"
            }`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
