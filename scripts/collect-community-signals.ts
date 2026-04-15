/**
 * 에이전트 콘텐츠 자동 수집 스크립트
 *
 * RSS/API 소스에서 AI 빌더 관련 콘텐츠를 발견하고
 * 커뮤니티 게시판에 자동 등록합니다.
 *
 * 사용: npx tsx scripts/collect-community-signals.ts
 * 환경변수: THENOCODES_API_TOKEN (API 키)
 */

const API_BASE = process.env.API_BASE ?? "https://thenocodes.org";

interface FeedItem {
  title: string;
  url: string;
  description?: string;
  source: string;
}

const RSS_FEEDS: { url: string; source: string }[] = [
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News" },
  { url: "https://huggingface.co/blog/feed.xml", source: "Hugging Face" },
  { url: "https://blog.anthropic.com/rss.xml", source: "Anthropic" },
  { url: "https://openai.com/blog/rss.xml", source: "OpenAI" },
  { url: "https://news.hada.io/rss", source: "GeekNews" },
];

async function fetchRSS(feedUrl: string, source: string): Promise<FeedItem[]> {
  try {
    const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: FeedItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const block = match[1];
      const title = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim();
      const link = block.match(/<link>(.*?)<\/link>/)?.[1]?.trim();
      const desc = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim();

      if (title && link) {
        items.push({ title, url: link, description: desc?.slice(0, 300), source });
      }
    }
    return items;
  } catch (e) {
    console.warn(`Failed to fetch ${source}:`, e instanceof Error ? e.message : e);
    return [];
  }
}

async function checkDuplicate(title: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts?board=community&q=${encodeURIComponent(title.slice(0, 30))}&limit=5`);
    if (!res.ok) return false;
    const data = await res.json();
    return (data.posts ?? []).some((p: { title: string }) =>
      p.title.toLowerCase().includes(title.slice(0, 20).toLowerCase())
    );
  } catch {
    return false;
  }
}

async function submitPost(item: FeedItem, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: "community",
        post_type: "found_it",
        title: item.title.slice(0, 120),
        body: item.description || `${item.source}에서 발견한 글입니다.`,
        link_url: item.url,
        author_name: `Scout (${item.source})`,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`  ✓ 등록: ${item.title.slice(0, 50)}`);
      return true;
    }
    console.warn(`  ✗ 실패: ${data.error}`);
    return false;
  } catch (e) {
    console.error(`  ✗ 에러:`, e instanceof Error ? e.message : e);
    return false;
  }
}

async function main() {
  const token = process.env.THENOCODES_API_TOKEN;
  if (!token) {
    console.error("THENOCODES_API_TOKEN 환경변수가 필요합니다.");
    console.log("발급: curl -X POST https://thenocodes.org/api/keys/issue -H 'Content-Type: application/json' -d '{\"name\":\"Scout Agent\",\"email\":\"scout@thenocodes.org\"}'");
    process.exit(1);
  }

  console.log(`수집 시작 (${RSS_FEEDS.length}개 소스)`);
  let total = 0;
  let submitted = 0;
  let skipped = 0;

  for (const feed of RSS_FEEDS) {
    console.log(`\n[${feed.source}]`);
    const items = await fetchRSS(feed.url, feed.source);
    console.log(`  ${items.length}개 항목 발견`);
    total += items.length;

    for (const item of items) {
      const isDup = await checkDuplicate(item.title);
      if (isDup) {
        console.log(`  - 중복: ${item.title.slice(0, 40)}`);
        skipped++;
        continue;
      }

      const ok = await submitPost(item, token);
      if (ok) submitted++;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n완료: ${total}개 발견 → ${submitted}개 등록, ${skipped}개 중복 스킵`);
}

main();
