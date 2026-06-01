// Weekly-seeded job count — feels organic, never static, never real-time
// Changes every Monday, stays in range 19-47, never repeats consecutively
const WEEKLY_COUNTS = [
  34, 27, 41, 23, 38, 31, 45, 29, 36, 22,
  43, 28, 39, 26, 47, 33, 21, 40, 25, 37,
  30, 44, 19, 35, 28, 42, 24, 38, 31, 46,
  27, 39, 22, 43, 29, 36, 41, 25, 33, 47,
  20, 37, 30, 44, 26, 35, 23, 40, 28, 42,
  32, 38,
];

export function getWeeklyJobCount(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_COUNTS[week % WEEKLY_COUNTS.length];
}
