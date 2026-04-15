/**
 * Canonical Seoul-timezone ISO week calculation.
 * Uses the Thursday-based algorithm per ISO 8601.
 */
export function getSeoulISOWeek(date = new Date()): string {
  const seoulStr = date.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  const seoulDate = new Date(seoulStr);
  const thursday = new Date(seoulDate);
  thursday.setDate(seoulDate.getDate() + (4 - (seoulDate.getDay() || 7)));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function getDateLabel(dateStr: string): string {
  const seoul = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const postDate = seoul.format(new Date(dateStr));
  const today = seoul.format(new Date());
  if (postDate === today) return "오늘";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (postDate === seoul.format(yesterday)) return "어제";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(dateStr));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
