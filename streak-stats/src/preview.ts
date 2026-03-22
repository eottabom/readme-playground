import * as fs from "fs";
import * as path from "path";
import { ContributionWeek } from "./contributions";
import { calculateStreak } from "./streak";
import { resolveTheme, THEMES } from "./themes";
import { generateStreakCard } from "./svg-card";

function generateMockWeeks(): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];

  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const isWeekday = d >= 1 && d <= 5;
      const baseChance = isWeekday ? 0.7 : 0.3;

      // Make the last ~15 days always have contributions (current streak)
      const daysFromEnd = (52 - w) * 7 - d;
      const forceContribution = daysFromEnd <= 15 && daysFromEnd > 0;

      // Create a long streak around weeks 20-24 (longest streak ~30 days)
      const inLongStreak = w >= 18 && w <= 22;

      const hasContribution = forceContribution || inLongStreak || Math.random() < baseChance;

      let level = 0;
      let count = 0;
      if (hasContribution) {
        const r = Math.random();
        if (r < 0.4) {
          level = 1;
          count = Math.floor(Math.random() * 3) + 1;
        } else if (r < 0.7) {
          level = 2;
          count = Math.floor(Math.random() * 5) + 3;
        } else if (r < 0.9) {
          level = 3;
          count = Math.floor(Math.random() * 8) + 6;
        } else {
          level = 4;
          count = Math.floor(Math.random() * 15) + 10;
        }
      }

      const date = new Date();
      date.setDate(date.getDate() - (52 - w) * 7 + d);

      days.push({
        date: date.toISOString().split("T")[0],
        count,
        level,
      });
    }
    weeks.push({ days });
  }

  return weeks;
}

function main(): void {
  const weeks = generateMockWeeks();
  const streak = calculateStreak(weeks);

  const outputDir = path.resolve(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate preview for each theme
  const themeNames = Object.keys(THEMES);
  for (const themeName of themeNames) {
    const theme = resolveTheme(themeName, {});
    const svg = generateStreakCard({
      username: "demo-user",
      streak,
      theme,
      locale: "en",
    });

    const filename = themeName === "default"
      ? "streak-stats-preview.svg"
      : `streak-stats-preview-${themeName}.svg`;
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, svg, "utf-8");
    console.log(`Generated: ${outputPath}`);
  }

  console.log(`\nStreak results:`);
  console.log(`  Current streak: ${streak.currentStreak} days (${streak.currentStreakStart} ~ ${streak.currentStreakEnd})`);
  console.log(`  Longest streak: ${streak.longestStreak} days (${streak.longestStreakStart} ~ ${streak.longestStreakEnd})`);
}

main();
