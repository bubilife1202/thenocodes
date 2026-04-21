import { NextResponse } from "next/server";
import { postDiscordWebhook } from "@/lib/discord/webhook";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const expected = process.env.DISCORD_POST_TOKEN || process.env.ADMIN_PASSWORD;

  return !!expected && token === expected;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const content = String(formData.get("content") || "");
      const username = String(formData.get("username") || "");
      const avatarUrl = String(formData.get("avatar_url") || "");
      const fileEntry = formData.get("file");

      if (fileEntry instanceof File) {
        const arrayBuffer = await fileEntry.arrayBuffer();

        await postDiscordWebhook({
          content,
          username: username || undefined,
          avatarUrl: avatarUrl || undefined,
          file: {
            data: arrayBuffer,
            filename: fileEntry.name,
            contentType: fileEntry.type || "application/octet-stream",
          },
        });
      } else {
        await postDiscordWebhook({
          content,
          username: username || undefined,
          avatarUrl: avatarUrl || undefined,
        });
      }

      return NextResponse.json({ ok: true });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          content?: string;
          username?: string;
          avatar_url?: string;
        }
      | null;

    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await postDiscordWebhook({
      content: body.content,
      username: body.username,
      avatarUrl: body.avatar_url,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Discord post error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
