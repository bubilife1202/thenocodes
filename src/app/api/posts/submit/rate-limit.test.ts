import test from "node:test";
import assert from "node:assert/strict";

import {
  getNextDailyPostCount,
  hasExceededDailyPostLimit,
  isWithinDailyWindow,
} from "./rate-limit";

test("isWithinDailyWindow only treats timestamps inside the rolling 24h window as active", () => {
  const now = Date.parse("2026-04-14T12:00:00.000Z");
  assert.equal(isWithinDailyWindow("2026-04-14T11:59:59.000Z", now), true);
  assert.equal(isWithinDailyWindow("2026-04-13T11:59:59.000Z", now), false);
  assert.equal(isWithinDailyWindow(null, now), false);
});

test("hasExceededDailyPostLimit enforces 50 posts only within the active daily window", () => {
  const now = Date.parse("2026-04-14T12:00:00.000Z");
  assert.equal(hasExceededDailyPostLimit(50, "2026-04-14T11:59:59.000Z", now), true);
  assert.equal(hasExceededDailyPostLimit(50, "2026-04-13T11:59:59.000Z", now), false);
  assert.equal(hasExceededDailyPostLimit(12, "2026-04-14T11:59:59.000Z", now), false);
});

test("getNextDailyPostCount resets stale counters and increments active counters", () => {
  const now = Date.parse("2026-04-14T12:00:00.000Z");
  assert.equal(getNextDailyPostCount(49, "2026-04-14T11:59:59.000Z", now), 50);
  assert.equal(getNextDailyPostCount(50, "2026-04-13T11:59:59.000Z", now), 1);
  assert.equal(getNextDailyPostCount(null, null, now), 1);
});
