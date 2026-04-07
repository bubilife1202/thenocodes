import test from "node:test";
import assert from "node:assert/strict";
import {
  getHackathonStatus,
  isKoreanHackathon,
  sortHackathons,
  type HackathonLike,
} from "./hackathons";

function makeHackathon(overrides: Partial<HackathonLike> = {}): HackathonLike {
  return {
    source: "eventus",
    title: "서울 AI 해커톤",
    description: "한국 해커톤",
    organizer: "The Nocodes",
    tags: ["AI", "해커톤"],
    starts_at: "2026-04-01T00:00:00.000Z",
    ends_at: "2026-04-10T00:00:00.000Z",
    location: "서울/경기/인천",
    url: "https://event-us.kr/test/1",
    ...overrides,
  };
}

test("isKoreanHackathon keeps Korean listings and drops foreign ones", () => {
  const korean = makeHackathon();
  const foreign = makeHackathon({
    source: "devpost",
    title: "Global Climate Hack",
    description: "Build for climate",
    organizer: "Devpost",
    tags: ["AI"],
    location: "Online",
    url: "https://devpost.com/software/global-climate-hack",
  });

  assert.equal(isKoreanHackathon(korean), true);
  assert.equal(isKoreanHackathon(foreign), false);
});

test("sortHackathons prioritizes active, then upcoming, then most recently ended", () => {
  const now = new Date("2026-04-07T00:00:00.000Z");
  const rows = [
    makeHackathon({
      title: "Older Ended",
      starts_at: "2026-03-01T00:00:00.000Z",
      ends_at: "2026-04-01T00:00:00.000Z",
    }),
    makeHackathon({
      title: "Upcoming Soon",
      starts_at: "2026-04-09T00:00:00.000Z",
      ends_at: "2026-04-20T00:00:00.000Z",
    }),
    makeHackathon({
      title: "Active Soonest Deadline",
      starts_at: "2026-04-02T00:00:00.000Z",
      ends_at: "2026-04-08T00:00:00.000Z",
    }),
    makeHackathon({
      title: "Recently Ended",
      starts_at: "2026-03-10T00:00:00.000Z",
      ends_at: "2026-04-06T00:00:00.000Z",
    }),
  ];

  assert.deepEqual(
    sortHackathons(rows, now).map((row) => row.title),
    ["Active Soonest Deadline", "Upcoming Soon", "Recently Ended", "Older Ended"],
  );
});

test("getHackathonStatus uses dates consistently around now", () => {
  const now = new Date("2026-04-07T00:00:00.000Z");

  assert.equal(getHackathonStatus(makeHackathon(), now), "active");
  assert.equal(
    getHackathonStatus(
      makeHackathon({
        starts_at: "2026-04-08T00:00:00.000Z",
        ends_at: "2026-04-20T00:00:00.000Z",
      }),
      now,
    ),
    "upcoming",
  );
  assert.equal(
    getHackathonStatus(
      makeHackathon({
        starts_at: "2026-03-01T00:00:00.000Z",
        ends_at: "2026-04-06T00:00:00.000Z",
      }),
      now,
    ),
    "ended",
  );
});
