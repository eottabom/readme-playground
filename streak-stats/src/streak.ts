import { ContributionDay, ContributionWeek } from "./contributions";

export interface StreakResult {
  currentStreak: number;
  currentStreakStart: string; // YYYY-MM-DD
  currentStreakEnd: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
}

function previousDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0];
}

export function calculateStreak(weeks: ContributionWeek[]): StreakResult {
  // Flatten and sort all days by date ascending
  const allDays: ContributionDay[] = [];
  for (const week of weeks) {
    for (const day of week.days) {
      allDays.push(day);
    }
  }
  allDays.sort((a, b) => a.date.localeCompare(b.date));

  if (allDays.length === 0) {
    return {
      currentStreak: 0,
      currentStreakStart: "",
      currentStreakEnd: "",
      longestStreak: 0,
      longestStreakStart: "",
      longestStreakEnd: "",
    };
  }

  // Build a map for quick lookup
  const dayMap = new Map<string, ContributionDay>();
  for (const day of allDays) {
    dayMap.set(day.date, day);
  }

  // Longest streak: forward scan
  let longestLen = 0;
  let longestStart = "";
  let longestEnd = "";
  let runLen = 0;
  let runStart = "";

  for (const day of allDays) {
    if (day.level > 0) {
      if (runLen === 0) {
        runStart = day.date;
      }
      runLen++;
      if (runLen > longestLen) {
        longestLen = runLen;
        longestStart = runStart;
        longestEnd = day.date;
      }
    } else {
      runLen = 0;
    }
  }

  // Current streak: backward scan from today (or yesterday if today has no activity)
  const today = new Date().toISOString().split("T")[0];
  const lastDataDate = allDays[allDays.length - 1].date;

  // Start from the more recent of today or last data date
  let startDate = today <= lastDataDate ? today : lastDataDate;

  const startDay = dayMap.get(startDate);
  if (!startDay || startDay.level === 0) {
    // Today has no contribution yet — check from yesterday
    startDate = previousDay(startDate);
  }

  let currentLen = 0;
  let currentStart = "";
  let currentEnd = "";
  let checkDate = startDate;

  while (dayMap.has(checkDate) && dayMap.get(checkDate)!.level > 0) {
    if (currentLen === 0) {
      currentEnd = checkDate;
    }
    currentStart = checkDate;
    currentLen++;
    checkDate = previousDay(checkDate);
  }

  return {
    currentStreak: currentLen,
    currentStreakStart: currentStart,
    currentStreakEnd: currentEnd,
    longestStreak: longestLen,
    longestStreakStart: longestStart,
    longestStreakEnd: longestEnd,
  };
}
