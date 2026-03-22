import * as fs from "fs";
import * as path from "path";
import { fetchContributions } from "./contributions";
import { calculateStreak } from "./streak";
import { resolveTheme } from "./themes";
import { generateStreakCard } from "./svg-card";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: ${name} environment variable is required`);
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  const username = getRequiredEnv("GITHUB_USERNAME");
  const token = process.env.GITHUB_TOKEN ?? "";

  const themeName = process.env.THEME || "default";
  const locale = process.env.LOCALE || "en";
  const hideTitle = process.env.HIDE_TITLE === "true";
  const outputDir = process.env.OUTPUT_DIR || "output";
  const outputFile = process.env.OUTPUT_FILE || "streak-stats.svg";

  const theme = resolveTheme(themeName, {
    background: process.env.BG_COLOR,
    border: process.env.BORDER_COLOR,
    title: process.env.TITLE_COLOR,
    value: process.env.VALUE_COLOR,
    label: process.env.LABEL_COLOR,
    accent: process.env.ACCENT_COLOR,
    dateRange: process.env.DATE_COLOR,
  });

  console.log(`Fetching contributions for @${username}...`);

  const { weeks } = await fetchContributions(username, token || undefined);
  const streak = calculateStreak(weeks);

  console.log(`Current streak: ${streak.currentStreak} days`);
  console.log(`Longest streak: ${streak.longestStreak} days`);

  const svg = generateStreakCard({
    username,
    streak,
    theme,
    locale,
    hideTitle,
  });

  const outputPath = path.resolve(process.cwd(), outputDir, outputFile);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
  fs.writeFileSync(outputPath, svg, "utf-8");
  console.log(`Generated SVG: ${outputPath}`);
}

main().catch((err) => {
  console.error("Failed to generate streak stats:", err);
  process.exit(1);
});
