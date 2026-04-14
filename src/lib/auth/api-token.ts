const TOKEN_PREFIX = "tnc_live_";

export function generateToken(): { token: string; hash: string; prefix: string } {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const token = `${TOKEN_PREFIX}${suffix}`;
  return { token, hash: "", prefix: token.slice(0, 16) };
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createToken(): Promise<{ token: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const token = `${TOKEN_PREFIX}${suffix}`;
  const hash = await hashToken(token);
  return { token, hash, prefix: token.slice(0, 16) };
}

export async function verifyToken(token: string) {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const hash = await hashToken(token);
  return hash;
}
