import { strict as assert } from "node:assert";
import test from "node:test";
import { extractEventUrls, parseLumaEventFromHtml } from "./luma.js";

test("extractEventUrls excludes Luma app/store and non-event links", () => {
  const html = `
    <a href="/haoh7sla">event</a>
    <a href="https://luma.com/android">android app</a>
    <a href="https://luma.com/app">app</a>
    <a href="/seoul?k=p">city</a>
    <a href="https://lu.ma/modular-seoul">alternate host</a>
  `;

  assert.deepEqual(extractEventUrls(html), [
    "https://luma.com/haoh7sla",
    "https://luma.com/modular-seoul",
  ]);
});

test("parseLumaEventFromHtml prefers JSON-LD event fields and strips Luma/noise copy", () => {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Seoul | Claude Bloom × AB180 x Myrealtrip",
    description: "From Claude Blue to Bloom — AI 시대, 우리는 어떻게 피어나고 있는가\nHosted by 클라이원트\nPlease register to see the exact location of this event.",
    startDate: "2026-04-25T11:00:00.000+09:00",
    endDate: "2026-04-25T13:00:00.000+09:00",
    location: {
      "@type": "Place",
      name: "Seoul",
      address: "Register to See Address",
    },
    image: ["https://images.lumacdn.com/event.png"],
    organizer: [
      { "@type": "Organization", name: "Cliwant", url: "https://luma.com/user/cliwant" },
      { "@type": "Organization", name: "조세희" },
    ],
  });
  const html = `
    <html>
      <head>
        <title>Seoul | Claude Bloom × AB180 x Myrealtrip · Luma</title>
        <meta property="og:title" content="Seoul | Claude Bloom × AB180 x Myrealtrip · Luma" />
        <meta property="og:description" content="Hosted by…" />
        <script type="application/ld+json">${jsonLd}</script>
      </head>
      <body>
        Going 53 Presented by Cliwant Subscribe
      </body>
    </html>
  `;

  const event = parseLumaEventFromHtml("https://luma.com/haoh7sla", html, new Date("2026-04-20T00:00:00.000Z"));

  assert.ok(event);
  assert.equal(event.external_id, "haoh7sla");
  assert.equal(event.title, "Seoul | Claude Bloom × AB180 x Myrealtrip");
  assert.equal(event.starts_at, "2026-04-25T02:00:00.000Z");
  assert.equal(event.ends_at, "2026-04-25T04:00:00.000Z");
  assert.equal(event.organizer, "Cliwant · 조세희");
  assert.equal(event.location, "Seoul");
  assert.equal(event.thumbnail_url, "https://images.lumacdn.com/event.png");
  assert.equal(event.category, "meetup");
  assert.ok(!/·\s*Luma|Presented by|Subscribe|Going|Please register/i.test(JSON.stringify(event)));
});

test("parseLumaEventFromHtml falls back to Seoul when Luma hides the exact venue", () => {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Hermes Agent Community Meetup @ Seoul",
    description: "AI builders meetup in Seoul",
    startDate: "2026-05-09T14:00:00.000+09:00",
    endDate: "2026-05-09T18:00:00.000+09:00",
    location: { "@type": "Place", name: "Register to See Address", address: "Register to See Address" },
    organizer: [{ "@type": "Organization", name: "Sigrid Jin" }],
  });
  const html = `
    <script type="application/ld+json">${jsonLd}</script>
    <main>Please register to see the exact of this event. Hosted By Sigrid Jin Going 12</main>
  `;

  const event = parseLumaEventFromHtml("https://luma.com/1cwwvh0p", html, new Date("2026-05-01T00:00:00.000Z"));

  assert.ok(event);
  assert.equal(event.location, "서울");
  assert.ok(!/Please register|Going|Hosted By/i.test(JSON.stringify(event)));
});

test("parseLumaEventFromHtml drops already-ended Luma events with structured dates", () => {
  const html = `
    <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Event","name":"AI Builder Seoul","description":"AI meetup in Seoul","startDate":"2026-04-01T10:00:00+09:00","endDate":"2026-04-01T12:00:00+09:00","location":{"@type":"Place","name":"Seoul"}}
    </script>
  `;

  assert.equal(parseLumaEventFromHtml("https://luma.com/past1", html, new Date("2026-04-02T00:00:00.000Z")), null);
});
