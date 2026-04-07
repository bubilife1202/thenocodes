import { getCurrentUser } from "@/lib/data/users";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-6 mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-[#3F3F46]">Admin</h1>
        <nav className="flex gap-4">
          <Link href="/admin" className="text-sm text-[#71717A] hover:text-[#3F3F46]">대시보드</Link>
          <Link href="/admin/challenges" className="text-sm text-[#71717A] hover:text-[#3F3F46]">챌린지 관리</Link>
          <Link href="/admin/proposals" className="text-sm text-[#71717A] hover:text-[#3F3F46]">문제 제안</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
