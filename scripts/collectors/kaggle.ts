import type { Hackathon } from "./types.js";

const KAGGLE_API = "https://www.kaggle.com/api/v1/competitions/list";

export async function collectKaggle(): Promise<Hackathon[]> {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;

  if (!username || !key) {
    console.warn("[Kaggle] KAGGLE_USERNAME or KAGGLE_KEY not set, skipping");
    return [];
  }

  const auth = Buffer.from(`${username}:${key}`).toString("base64");
  const hackathons: Hackathon[] = [];

  for (const group of ["general", "featured", "research", "playground"]) {
    const res = await fetch(`${KAGGLE_API}?group=${group}&page=1`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      console.error(`[Kaggle] ${group} failed: ${res.status}`);
      continue;
    }

    const items: any[] = await res.json();

    for (const c of items) {
      if (!c.deadline) continue;

      hackathons.push({
        source: "kaggle",
        external_id: c.ref ?? c.id?.toString(),
        title: c.title,
        description: c.description ?? "",
        organizer: c.organizationName ?? "Kaggle",
        url: `https://www.kaggle.com/competitions/${c.ref}`,
        thumbnail_url: null,
        prize: c.reward ?? null,
        tags: c.tags?.map((t: any) => t.name ?? t) ?? ["Data Science"],
        starts_at: c.enabledDate ?? null,
        ends_at: c.deadline ?? null,
        location: "Online",
      });
    }
  }

  console.log(`[Kaggle] Collected ${hackathons.length} competitions`);
  return hackathons;
}
