import { ContributionWeek } from "./contributions";
import {
  TOP_CELL, TOP_GAP, TOP_OFFSET_Y, TOP_COL_W, TOP_WEEKS,
  getGardenWeeks, CELL_SIZE, CELL_GAP, COL_W,
  WALK_DURATION, FULL_CYCLE, DEFAULT_OPTIONS,
} from "./svg/constants";
import { generateTopContributionGraph } from "./svg/contribution-graph";
import { gardenOffsetX, generateEmptyField, generateSeedScatter, generateWatering, generateGrowth } from "./svg/garden";
import { generateLegoMinifigure } from "./svg/lego-character";

export interface GeneratorOptions {
  username: string;
  weeks: ContributionWeek[];
  totalContributions: number;
  legoColor?: string;
  gardenColorEmpty?: string;
  gardenColors?: string[];
  waterColor?: string;
  backgroundColor?: string;
  showTotal?: boolean;
}

export function generateSVG(options: GeneratorOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const {
    username, weeks, totalContributions,
    legoColor, gardenColors, gardenColorEmpty,
    waterColor, backgroundColor, showTotal,
  } = opts;

  // Layout calculations
  const topGraphWidth = Math.min(weeks.length, TOP_WEEKS) * TOP_COL_W + 100;
  const GARDEN_WEEKS = getGardenWeeks();
  const gardenWidth = GARDEN_WEEKS * COL_W + 120;
  const totalWidth = Math.max(topGraphWidth, gardenWidth);

  const topGraphBottom = TOP_OFFSET_Y + 7 * (TOP_CELL + TOP_GAP) + 15;
  const gardenOffsetY = topGraphBottom + 30;
  const gx = gardenOffsetX(totalWidth);

  const gardenBottom = gardenOffsetY + 7 * (CELL_SIZE + CELL_GAP) + 15;
  const gardenLabelY = gardenBottom + 24;
  const totalHeight = gardenLabelY + 30;

  // LEGO walk path
  const legoStartX = gx - 90;
  const legoEndX = gx + GARDEN_WEEKS * COL_W + 30;
  const legoY = gardenOffsetY - 50;

  const displayWeeks = weeks.slice(-GARDEN_WEEKS);

  // Fence posts on left edge
  const fencePosts = [0, 2, 4, 6].map((d) => {
    const fy = gardenOffsetY + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
    return `
    <g transform="translate(${gx - 16}, ${fy - 8})">
      <rect x="0" y="0" width="3" height="16" rx="0.5" fill="#a08060" opacity="0.25"/>
      <rect x="-1" y="2" width="5" height="2" rx="0.5" fill="#a08060" opacity="0.2"/>
    </g>`;
  }).join("\n");

  // Sun rays (12 rays radiating outward)
  const sunRays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
    const rad = (a * Math.PI) / 180;
    return `<line x1="${Math.cos(rad) * 18}" y1="${Math.sin(rad) * 18}" x2="${Math.cos(rad) * 30}" y2="${Math.sin(rad) * 30}"
      stroke="#ffd93d" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`;
  }).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#60aed4;stop-opacity:0.75"/>
      <stop offset="100%" style="stop-color:${backgroundColor};stop-opacity:1"/>
    </linearGradient>
    <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#C4A76C;stop-opacity:0.12"/>
      <stop offset="100%" style="stop-color:#D2B48C;stop-opacity:0.04"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#sky)" rx="10"/>
  <rect x="0" y="${gardenBottom}" width="100%" height="${totalHeight - gardenBottom}" fill="url(#ground)"/>

  <!-- Title -->
  <text x="${totalWidth / 2}" y="24" text-anchor="middle" font-size="16" font-weight="bold" fill="#24292f"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    ${username}'s Contribution Garden
  </text>
  ${showTotal ? `<text x="${totalWidth / 2}" y="42" text-anchor="middle" font-size="11" fill="#57606a"
        font-family="-apple-system, BlinkMacSystemFont, sans-serif">
    ${totalContributions} contributions in the last year
  </text>` : ""}

  <!-- Cycle clock -->
  <rect x="0" y="0" width="0" height="0" opacity="0">
    <animate id="cycle" attributeName="x" from="0" to="0" dur="${FULL_CYCLE}s" repeatCount="indefinite"/>
  </rect>

  <!-- Contribution Graph -->
  <g>
    ${generateTopContributionGraph(weeks, gardenColors!, gardenColorEmpty!, totalWidth)}
  </g>

  <!-- Legend -->
  <g transform="translate(${totalWidth - 170}, ${topGraphBottom - 3})">
    <text x="0" y="0" font-size="8" fill="#57606a" font-family="sans-serif">Less</text>
    <rect x="22" y="-8" width="9" height="9" rx="1.5" fill="${gardenColorEmpty}"/>
    ${gardenColors!.map((c, i) => `<rect x="${34 + i * 13}" y="-8" width="9" height="9" rx="1.5" fill="${c}"/>`).join("\n    ")}
    <text x="${34 + gardenColors!.length * 13 + 3}" y="0" font-size="8" fill="#57606a" font-family="sans-serif">More</text>
  </g>

  <!-- Separator -->
  <line x1="${gx}" y1="${topGraphBottom + 8}" x2="${gx + GARDEN_WEEKS * COL_W}" y2="${topGraphBottom + 8}"
        stroke="#d0d7de" stroke-width="0.5" opacity="0.4"/>

  <!-- Sun (top-right corner) -->
  <g transform="translate(${totalWidth - 40}, 32)">
    <circle cx="0" cy="0" r="22" fill="#ffd93d" opacity="0.25">
      <animate attributeName="r" values="20;24;20" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="0" cy="0" r="14" fill="#ffd93d" opacity="0.5"/>
    <circle cx="0" cy="0" r="9" fill="#ffe66d" opacity="0.8"/>
    ${sunRays}
  </g>

  <!-- Garden: empty dirt -->
  ${generateEmptyField(gx, gardenOffsetY)}

  <!-- Fence posts -->
  ${fencePosts}

  <!-- Animated garden content (fades out at cycle end, resets) -->
  <g>
    <animate attributeName="opacity" values="0;1;1;0;0"
             keyTimes="0;0.02;${((WALK_DURATION + 1.5) / FULL_CYCLE).toFixed(3)};${((WALK_DURATION + 2) / FULL_CYCLE).toFixed(3)};1"
             dur="${FULL_CYCLE}s" begin="cycle.begin" repeatCount="indefinite"/>

    <!-- Garden: seed scatter -->
    ${generateSeedScatter(displayWeeks, gx, gardenOffsetY, legoStartX, legoEndX, legoY)}

    <!-- Garden: watering -->
    ${generateWatering(displayWeeks, waterColor!, gx, gardenOffsetY, legoStartX, legoEndX, legoY)}

    <!-- Garden: growth -->
    ${generateGrowth(displayWeeks, gardenColors!, gardenColorEmpty!, gx, gardenOffsetY)}
  </g>

  <!-- LEGO Minifigure -->
  ${generateLegoMinifigure(legoColor!, waterColor!, legoStartX, legoEndX, legoY)}

  <!-- Garden label -->
  <text x="${gx + (GARDEN_WEEKS * COL_W) / 2}" y="${gardenLabelY}" text-anchor="middle"
        font-size="10" fill="#999" font-family="-apple-system, BlinkMacSystemFont, sans-serif">
    Garden — last ${GARDEN_WEEKS} weeks
  </text>

</svg>`;
}
