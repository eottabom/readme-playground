import * as fs from "fs";
import * as path from "path";
import { fetchContributions } from "./contributions";
import { generateSVG } from "./svg-generator";
import { setGardenWeeks } from "./svg/constants";

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

  const legoColor = process.env.LEGO_COLOR || "#FFD700";
  const waterColor = process.env.WATER_COLOR || "#56c4f5";
  const backgroundColor = process.env.BG_COLOR || "#ffffff";
  const gardenWeeks = parseInt(process.env.GARDEN_WEEKS || "20", 10);
  const outputDir = process.env.OUTPUT_DIR || "output";
  const outputFile = process.env.OUTPUT_FILE || "lego-garden.svg";

  setGardenWeeks(gardenWeeks);

  console.log(`Fetching contributions for @${username}...`);

  const { weeks, total } = await fetchContributions(username, token || undefined);
  console.log(`Found ${total} contributions across ${weeks.length} weeks`);

  const svg = generateSVG({
    username,
    weeks,
    totalContributions: total,
    legoColor,
    waterColor,
    backgroundColor,
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
  console.error("Failed to generate garden:", err);
  process.exit(1);
});
