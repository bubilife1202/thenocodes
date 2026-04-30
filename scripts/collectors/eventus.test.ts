import { strict as assert } from "node:assert";
import test from "node:test";
import { buildEventUrl, classifyEventUsCategory, hasUsableEventUsSchedule } from "./eventus.js";

test("classifyEventUsCategory maps seminars and meetups to meetup category", () => {
  assert.equal(
    classifyEventUsCategory({ title: "생성형 AI 세미나", description: "실전 자동화 사례", tags: [], fallbackCategory: "hackathon" }),
    "meetup"
  );

  assert.equal(
    classifyEventUsCategory({ title: "AI Builder Meetup", description: "Seoul", tags: [], fallbackCategory: "contest" }),
    "meetup"
  );
});

test("classifyEventUsCategory keeps contests and hackathons distinct", () => {
  assert.equal(
    classifyEventUsCategory({ title: "AI 서비스 공모전", description: "", tags: [], fallbackCategory: "meetup" }),
    "contest"
  );

  assert.equal(
    classifyEventUsCategory({ title: "노코드 해커톤", description: "", tags: [], fallbackCategory: "contest" }),
    "hackathon"
  );
});

test("buildEventUrl uses the current Event-us public detail route", () => {
  assert.equal(buildEventUrl("spectory2", "123124"), "https://event-us.kr/spectory2/event/123124");
  assert.equal(buildEventUrl(null, "123124"), "https://event-us.kr/event/123124");
});

test("hasUsableEventUsSchedule drops legacy opportunities without a deadline", () => {
  const now = new Date("2026-04-30T00:00:00.000Z");

  assert.equal(
    hasUsableEventUsSchedule({ category: "hackathon", startsAt: null, endsAt: null, now }),
    false,
  );
  assert.equal(
    hasUsableEventUsSchedule({ category: "contest", startsAt: "2026-05-01T00:00:00.000Z", endsAt: null, now }),
    false,
  );
  assert.equal(
    hasUsableEventUsSchedule({ category: "contest", startsAt: "2026-04-01T00:00:00.000Z", endsAt: "2026-05-10T00:00:00.000Z", now }),
    true,
  );
});

test("hasUsableEventUsSchedule keeps scheduled meetups and drops past rows", () => {
  const now = new Date("2026-04-30T00:00:00.000Z");

  assert.equal(
    hasUsableEventUsSchedule({ category: "meetup", startsAt: "2026-05-02T10:00:00.000Z", endsAt: null, now }),
    true,
  );
  assert.equal(
    hasUsableEventUsSchedule({ category: "meetup", startsAt: null, endsAt: null, now }),
    false,
  );
  assert.equal(
    hasUsableEventUsSchedule({ category: "meetup", startsAt: "2026-04-01T10:00:00.000Z", endsAt: "2026-04-02T10:00:00.000Z", now }),
    false,
  );
});
