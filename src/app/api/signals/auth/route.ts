import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "thenocodes2026";

  if (password !== adminPassword) {
    return NextResponse.json({ error: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("signals-admin", "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 12, // 12시간
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
