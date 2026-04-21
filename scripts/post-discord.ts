import { readFile } from "node:fs/promises";

type CliArgs = {
  content?: string;
  file?: string;
  username?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (!next) break;

    if (current === "--content") {
      args.content = next;
      i += 1;
    } else if (current === "--file") {
      args.file = next;
      i += 1;
    } else if (current === "--username") {
      args.username = next;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not configured.");
  }

  const args = parseArgs(process.argv.slice(2));

  if (!args.content && !args.file) {
    throw new Error("Use --content, --file, or both.");
  }

  const payload = {
    ...(args.content?.trim() ? { content: args.content.trim() } : {}),
    ...(args.username?.trim() ? { username: args.username.trim() } : {}),
    allowed_mentions: { parse: [] as string[] },
  };

  let response: Response;

  if (args.file) {
    const bytes = await readFile(args.file);
    const fileName = args.file.split("/").pop() || "upload.bin";
    const formData = new FormData();

    formData.set("payload_json", JSON.stringify(payload));
    formData.set("files[0]", new Blob([bytes]), fileName);

    response = await fetch(webhookUrl, {
      method: "POST",
      body: formData,
    });
  } else {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} ${errorText}`);
  }

  console.log("Discord post sent.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
