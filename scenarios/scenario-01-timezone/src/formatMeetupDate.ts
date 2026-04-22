/**
 * Formats a UTC datetime string into a localized meetup-date string.
 * @param utc  ISO 8601 UTC string, e.g. "2026-04-22T10:00:00Z"
 * @param tz   IANA timezone name — currently only "Asia/Seoul" is supported
 * @returns    e.g. "2026-04-22 (수) 19:00 KST"
 */
export function formatMeetupDate(utc: string, tz: string): string {
  if (tz !== 'Asia/Seoul') {
    throw new Error(`Unsupported timezone: ${tz}. Only "Asia/Seoul" is supported.`);
  }

  const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const OFFSET_HOURS = 9;

  const utcDate = new Date(utc);

  const rawHour = utcDate.getUTCHours() + OFFSET_HOURS;
  const localHour = rawHour % 24;
  const dayOverflow = rawHour > 24 ? 1 : 0;

  const advancedDate = new Date(utcDate);
  advancedDate.setUTCDate(utcDate.getUTCDate() + dayOverflow);

  const year = advancedDate.getUTCFullYear();
  const month = String(advancedDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(advancedDate.getUTCDate()).padStart(2, '0');

  const weekday = DAYS_KO[utcDate.getUTCDay()];

  const hourStr = String(localHour).padStart(2, '0');
  const minStr = String(utcDate.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} (${weekday}) ${hourStr}:${minStr} KST`;
}
