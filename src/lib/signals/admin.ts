import "server-only";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "thenocodes-signals-admin";
const ADMIN_COOKIE_TTL = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "thenocodes2026";
}

async function createAdminSessionToken() {
  // 비밀번호 원문을 쿠키에 넣지 않고 서버에서만 같은 토큰을 재생성해 비교한다.
  const input = new TextEncoder().encode(`signals-admin:${getAdminPassword()}`);
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAdminPassword(password: string) {
  return password === getAdminPassword();
}

export async function createSignalsAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_TTL,
    path: "/signals/new",
  });
}

export async function isSignalsAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  return session === (await createAdminSessionToken());
}
