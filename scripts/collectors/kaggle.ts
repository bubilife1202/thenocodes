import type { Hackathon } from "./types.js";

const KAGGLE_API = "https://www.kaggle.com/api/v1/competitions/list";

type KaggleCompetition = {
  deadline?: string | null;
  ref?: string | null;
  id?: number | string | null;
  title?: string | null;
  description?: string | null;
  organizationName?: string | null;
  reward?: string | null;
  tags?: Array<{ name?: string | null } | string> | null;
  enabledDate?: string | null;
};

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

    const items = (await res.json()) as KaggleCompetition[];

    for (const c of items) {
      const ref = c.ref ?? c.id?.toString();

      if (!c.deadline || !c.title || !ref) continue;

      const tags =
        c.tags
          ?.map((tag) => (typeof tag === "string" ? tag : tag.name))
          .filter((tag): tag is string => Boolean(tag)) ?? [];

      hackathons.push({
        source: "kaggle",
        external_id: ref,
        title: c.title,
        description: c.description ?? "",
        organizer: c.organizationName ?? "Kaggle",
        url: `https://www.kaggle.com/competitions/${ref}`,
        thumbnail_url: null,
        prize: c.reward ?? null,
        tags: tags.length ? tags : ["Data Science"],
        starts_at: c.enabledDate ?? null,
        ends_at: c.deadline ?? null,
        location: "Online",
      });
    }
  }

  console.log(`[Kaggle] Collected ${hackathons.length} competitions`);
  return hackathons;
}
