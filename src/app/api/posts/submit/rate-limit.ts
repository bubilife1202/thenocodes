const DAILY_POST_LIMIT = 50;
const DAILY_WINDOW_MS = 86400000;

export function isWithinDailyWindow(lastUsedAt: string | null | undefined, now = Date.now()) {
  if (!lastUsedAt) return false;
  const parsed = new Date(lastUsedAt).getTime();
  return Number.isFinite(parsed) && parsed > now - DAILY_WINDOW_MS;
}

export function hasExceededDailyPostLimit(
  postCount: number | null | undefined,
  lastUsedAt: string | null | undefined,
  now = Date.now(),
) {
  return (postCount ?? 0) >= DAILY_POST_LIMIT && isWithinDailyWindow(lastUsedAt, now);
}

export function getNextDailyPostCount(
  postCount: number | null | undefined,
  lastUsedAt: string | null | undefined,
  now = Date.now(),
) {
  return isWithinDailyWindow(lastUsedAt, now) ? (postCount ?? 0) + 1 : 1;
}
