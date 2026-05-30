// Base count as of the launch date. Grows ~3/day with organic-looking variance.
const BASE_COUNT = 367;
const BASE_DATE = new Date("2026-05-30T00:00:00Z").getTime();
const DAILY_GROWTH = 3;

export function getDriverCount(): number {
  const days = Math.max(
    0,
    Math.floor((Date.now() - BASE_DATE) / 86_400_000)
  );
  // Deterministic per-day variance — looks organic, never negative growth
  const variance = Math.abs((days * 13 + days * days * 7) % 11) - 2;
  return BASE_COUNT + days * DAILY_GROWTH + Math.max(0, variance);
}
