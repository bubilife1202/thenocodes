type DiscordWebhookFile = {
  data: ArrayBuffer | Uint8Array;
  filename: string;
  contentType?: string;
};

type DiscordWebhookPayload = {
  content?: string;
  username?: string;
  avatarUrl?: string;
  file?: DiscordWebhookFile;
};

function getDiscordWebhookUrl() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not configured.");
  }

  return webhookUrl;
}

export async function postDiscordWebhook(payload: DiscordWebhookPayload) {
  const webhookUrl = getDiscordWebhookUrl();
  const content = payload.content?.trim();

  if (!content && !payload.file) {
    throw new Error("Either content or file is required to post to Discord.");
  }

  const body = {
    ...(content ? { content } : {}),
    ...(payload.username ? { username: payload.username } : {}),
    ...(payload.avatarUrl ? { avatar_url: payload.avatarUrl } : {}),
    allowed_mentions: { parse: [] as string[] },
  };

  let response: Response;

  if (payload.file) {
    const formData = new FormData();
    const binary =
      payload.file.data instanceof Uint8Array
        ? payload.file.data.slice().buffer
        : payload.file.data;
    const blob = new Blob([binary], {
      type: payload.file.contentType || "application/octet-stream",
    });

    formData.set("payload_json", JSON.stringify(body));
    formData.set("files[0]", blob, payload.file.filename);

    response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} ${errorText}`);
  }
}
