import assert from "node:assert/strict";
import test from "node:test";
import { buildTodayActivity, formatKstActivityTime, getKstDayStart, getLatestActivityAt } from "./today-board";

test("getKstDayStart returns midnight in Korea time as a UTC Date", () => {
  const start = getKstDayStart(new Date("2026-04-24T12:30:00.000Z"));
  assert.equal(start.toISOString(), "2026-04-23T15:00:00.000Z");
});

test("buildTodayActivity keeps only current KST day items and sorts newest first", () => {
  const now = new Date("2026-04-24T12:30:00.000Z");
  const items = buildTodayActivity([
    { id: "old", title: "어제 항목", href: "/old", source: "흐름", timestamp: "2026-04-23T14:59:59.000Z" },
    { id: "morning", title: "오늘 아침", href: "/morning", source: "기회", timestamp: "2026-04-23T23:00:00.000Z" },
    { id: "latest", title: "오늘 최신", href: "/latest", source: "Hermes", timestamp: "2026-04-24T11:00:00.000Z" },
    { id: "invalid", title: "날짜 없음", href: "/invalid", source: "기타", timestamp: null },
  ], now, 5);

  assert.deepEqual(items.map((item) => item.id), ["latest", "morning"]);
});

test("getLatestActivityAt returns latest valid timestamp", () => {
  const latest = getLatestActivityAt([
    { id: "a", title: "A", href: "/a", source: "A", timestamp: "2026-04-21T00:00:00.000Z" },
    { id: "b", title: "B", href: "/b", source: "B", timestamp: null },
    { id: "c", title: "C", href: "/c", source: "C", timestamp: "2026-04-24T05:00:00.000Z" },
  ]);

  assert.equal(latest?.toISOString(), "2026-04-24T05:00:00.000Z");
});

test("formatKstActivityTime renders a compact Korean-time freshness label", () => {
  assert.equal(formatKstActivityTime("2026-04-24T05:07:00.000Z"), "14:07 KST");
});

test("formatKstActivityTime returns 수집 대기 for missing or invalid timestamps", () => {
  assert.equal(formatKstActivityTime(null), "수집 대기");
  assert.equal(formatKstActivityTime("not-a-date"), "수집 대기");
});
