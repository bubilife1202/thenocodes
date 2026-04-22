import { describe, it, expect } from 'vitest';
import { formatMeetupDate } from './formatMeetupDate.js';

describe('formatMeetupDate', () => {
  it('formats a midday Seoul meetup (same UTC/KST day)', () => {
    // UTC 2026-04-22 03:00 → Seoul 2026-04-22 12:00, Wednesday (수)
    expect(formatMeetupDate('2026-04-22T03:00:00Z', 'Asia/Seoul')).toBe(
      '2026-04-22 (수) 12:00 KST',
    );
  });

  it('formats an evening Seoul meetup (same UTC/KST day)', () => {
    // UTC 2026-04-22 10:00 → Seoul 2026-04-22 19:00, Wednesday (수)
    expect(formatMeetupDate('2026-04-22T10:00:00Z', 'Asia/Seoul')).toBe(
      '2026-04-22 (수) 19:00 KST',
    );
  });

  it('formats a late-night meetup that crosses midnight into the next Seoul day', () => {
    // UTC 2026-04-28 16:30 Tuesday → Seoul 2026-04-29 01:30 Wednesday (수)
    expect(formatMeetupDate('2026-04-28T16:30:00Z', 'Asia/Seoul')).toBe(
      '2026-04-29 (수) 01:30 KST',
    );
  });
});
