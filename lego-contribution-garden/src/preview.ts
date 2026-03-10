import * as fs from "fs";
import * as path from "path";
import { ContributionWeek } from "./contributions";
import { generateSVG } from "./svg-generator";

/**
 * Generate a preview SVG with mock data (no GitHub token needed).
 * Useful for local development and testing.
 */
function generateMockWeeks(): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];
  const levels = [0, 1, 2, 3, 4];

  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      // Create a realistic-looking pattern
      const isWeekday = d >= 1 && d <= 5;
      const baseChance = isWeekday ? 0.7 : 0.3;
      const hasContribution = Math.random() < baseChance;

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
        level: levels[level],
      });
    }
    weeks.push({ days });
  }

  return weeks;
}

function main(): void {
  const weeks = generateMockWeeks();
  const total = weeks.reduce(
    (sum, w) => sum + w.days.reduce((s, d) => s + d.count, 0),
    0
  );

  const svg = generateSVG({
    username: "demo-user",
    weeks,
    totalContributions: total,
  });

  const outputDir = path.resolve(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "lego-garden-preview.svg");
  fs.writeFileSync(outputPath, svg, "utf-8");
  console.log(`Preview generated: ${outputPath}`);
  console.log(`Total mock contributions: ${total}`);
}

main();
