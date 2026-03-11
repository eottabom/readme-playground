import { ContributionWeek } from "../contributions";
import {
  getGardenWeeks, CELL_SIZE, CELL_GAP, COL_W,
  WALK_DURATION, GROW_TIME, FULL_CYCLE,
  getGrassHeight, arriveTime, adjustBrightness, prand, trapezoidPath,
  extAnim, extAnimSpline,
} from "./constants";

export function gardenOffsetX(totalWidth: number): number {
  const gardenWidth = getGardenWeeks() * COL_W;
  return Math.max(40, (totalWidth - gardenWidth) / 2);
}

export function generateEmptyField(offsetX: number, offsetY: number): string {
  const el: string[] = [];
  const gardenW = getGardenWeeks() * COL_W;
  const gardenH = 7 * (CELL_SIZE + CELL_GAP);
  const pad = 8;

  el.push(`
    <rect x="${offsetX - pad}" y="${offsetY - pad}" width="${gardenW + pad * 2}" height="${gardenH + pad * 2}"
          rx="6" fill="#d9c9a1" opacity="0.12"/>
    <rect x="${offsetX - pad}" y="${offsetY - pad}" width="${gardenW + pad * 2}" height="${gardenH + pad * 2}"
          rx="6" fill="none" stroke="#b8a77e" stroke-width="0.8" opacity="0.2" stroke-dasharray="4,3"/>
  `);

  for (let d = 0; d < 6; d++) {
    const y = offsetY + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE + 0.5;
    el.push(`
      <line x1="${offsetX - 2}" y1="${y}" x2="${offsetX + gardenW - 2}" y2="${y}"
            stroke="#b8a77e" stroke-width="0.4" opacity="0.15"/>
    `);
  }

  for (let w = 0; w < getGardenWeeks(); w++) {
    for (let d = 0; d < 7; d++) {
      const x = offsetX + w * COL_W;
      const y = offsetY + d * (CELL_SIZE + CELL_GAP);
      el.push(`
        <path d="${trapezoidPath(x, y, CELL_SIZE, CELL_SIZE, 1.5)}"
              fill="#c8b78e" opacity="0.18"/>
      `);
    }
  }

  return el.join("\n");
}

export function generateSeedScatter(
  displayWeeks: ContributionWeek[],
  offsetX: number,
  offsetY: number,
  legoStartX: number,
  legoEndX: number,
  legoY: number
): string {
  const el: string[] = [];

  for (let w = 0; w < displayWeeks.length; w++) {
    const week = displayWeeks[w];
    const t = arriveTime(w);
    const charX = legoStartX + (t / WALK_DURATION) * (legoEndX - legoStartX);
    const handX = charX + 4;
    const handY = legoY + 50;

    for (let d = 0; d < week.days.length; d++) {
      const day = week.days[d];
      if (day.level === 0) continue;

      const tx = offsetX + w * COL_W + CELL_SIZE / 2;
      const ty = offsetY + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
      const st = t + d * 0.03;
      const midX = (handX + tx) / 2;
      const midY = Math.min(handY, ty) - 15;

      el.push(`
        <g>
          <ellipse cx="${handX}" cy="${handY}" rx="2" ry="2.8" fill="#8B6914" opacity="0"
                   transform="rotate(30,${handX},${handY})">
            <animate attributeName="opacity" ${extAnim(st, 0.5, ["0", "0.9", "0.9", "0"], [0, 0.1, 0.8, 1])}/>
            <animate attributeName="cx" ${extAnimSpline(st, 0.4, [`${handX}`, `${midX}`, `${tx}`], ["0.3 0 0.7 1", "0.3 0 0.7 1"])}/>
            <animate attributeName="cy" ${extAnimSpline(st, 0.4, [`${handY}`, `${midY}`, `${ty}`], ["0.1 0 0.5 1", "0.5 0 1 1"])}/>
          </ellipse>
          <circle cx="${tx - 3}" cy="${ty + 2}" r="1.5" fill="#8B7355" opacity="0">
            <animate attributeName="opacity" ${extAnim(st + 0.35, 0.3, ["0", "0.5", "0"])}/>
            <animate attributeName="cy" ${extAnim(st + 0.35, 0.3, [`${ty + 2}`, `${ty - 3}`])}/>
          </circle>
          <circle cx="${tx + 3}" cy="${ty + 2}" r="1.2" fill="#8B7355" opacity="0">
            <animate attributeName="opacity" ${extAnim(st + 0.37, 0.25, ["0", "0.4", "0"])}/>
            <animate attributeName="cy" ${extAnim(st + 0.37, 0.25, [`${ty + 2}`, `${ty - 4}`])}/>
          </circle>
          <circle cx="${tx}" cy="${ty}" r="1.5" fill="#6B5310" opacity="0">
            <animate attributeName="opacity" ${extAnim(st + 0.35, 1, ["0", "0.6", "0.6", "0"], [0, 0.3, 0.7, 1])}/>
          </circle>
        </g>
      `);
    }
  }

  return el.join("\n");
}

export function generateWatering(
  displayWeeks: ContributionWeek[],
  waterColor: string,
  offsetX: number,
  offsetY: number,
  legoStartX: number,
  legoEndX: number,
  legoY: number
): string {
  const el: string[] = [];

  for (let w = 0; w < displayWeeks.length; w++) {
    const week = displayWeeks[w];
    const wBase = arriveTime(w) + 0.4;
    const charX = legoStartX + (wBase / WALK_DURATION) * (legoEndX - legoStartX);
    const spoutX = charX + 60;
    const spoutY = legoY + 36;

    for (let d = 0; d < week.days.length; d++) {
      const day = week.days[d];
      if (day.level === 0) continue;

      const tx = offsetX + w * COL_W + CELL_SIZE / 2;
      const ty = offsetY + d * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
      const wt = wBase + d * 0.03;

      for (let i = 0; i < 3; i++) {
        const dx = tx + (i - 1) * 3;
        const delay = wt + i * 0.04;
        el.push(`
          <circle cx="${spoutX}" cy="${spoutY}" r="1.5" fill="${waterColor}" opacity="0">
            <animate attributeName="opacity" ${extAnim(delay, 0.4, ["0", "0.7", "0.3", "0"])}/>
            <animate attributeName="cx" ${extAnim(delay, 0.35, [`${spoutX}`, `${(spoutX + dx) / 2}`, `${dx}`])}/>
            <animate attributeName="cy" ${extAnimSpline(delay, 0.35, [`${spoutY}`, `${Math.min(spoutY, ty) - 8}`, `${ty}`], ["0.1 0 0.5 1", "0.5 0 1 1"])}/>
          </circle>
        `);
      }

      el.push(`
        <circle cx="${tx}" cy="${ty}" r="0" fill="none" stroke="${waterColor}" stroke-width="0.6" opacity="0">
          <animate attributeName="opacity" ${extAnim(wt + 0.25, 0.45, ["0", "0.3", "0"])}/>
          <animate attributeName="r" ${extAnim(wt + 0.25, 0.45, ["0", "7"])}/>
        </circle>
      `);
    }
  }

  return el.join("\n");
}

export function generateGrowth(
  displayWeeks: ContributionWeek[],
  gardenColors: string[],
  emptyColor: string,
  offsetX: number,
  offsetY: number
): string {
  const el: string[] = [];

  for (let w = 0; w < displayWeeks.length; w++) {
    const week = displayWeeks[w];
    const baseT = arriveTime(w) + 0.7;

    for (let d = 0; d < week.days.length; d++) {
      const day = week.days[d];
      const x = offsetX + w * COL_W;
      const y = offsetY + d * (CELL_SIZE + CELL_GAP);
      const t = baseT + d * 0.04;
      const cellColor = day.level === 0 ? "#c8b78e" : gardenColors[day.level - 1] || emptyColor;
      const cellOpacity = day.level === 0 ? "0.4" : "0.7";

      el.push(`
        <path d="${trapezoidPath(x, y, CELL_SIZE, CELL_SIZE, 1.5)}"
              fill="${cellColor}" opacity="0">
          <animate attributeName="opacity" ${extAnim(t, 0.4, ["0", cellOpacity])}/>
          <title>${day.date}: ${day.count} contributions</title>
        </path>
      `);

      if (day.level === 0) continue;

      const height = getGrassHeight(day.level);
      const color = gardenColors[day.level - 1];
      const darkerColor = adjustBrightness(color, -25);
      const lighterColor = adjustBrightness(color, 20);
      const seed = w * 7 + d;
      const cx = x + CELL_SIZE / 2;

      const sproutT = t + 0.1;
      el.push(`
        <g opacity="0">
          <animate attributeName="opacity" ${extAnim(sproutT, GROW_TIME + 0.3, ["0", "1", "1", "0"], [0, 0.1, 0.4, 1])}/>
          <line x1="${cx}" y1="${y}" x2="${cx}" y2="${y}" stroke="#7dc97d" stroke-width="1.5" stroke-linecap="round">
            <animate attributeName="y2" ${extAnim(sproutT, 0.3, [`${y}`, `${y - 5}`])}/>
          </line>
          <ellipse cx="${cx - 2}" cy="${y - 5}" rx="2" ry="1.5" fill="#9be9a8" opacity="0">
            <animate attributeName="opacity" ${extAnim(sproutT + 0.15, 0.2, ["0", "0.8"])}/>
          </ellipse>
          <ellipse cx="${cx + 2}" cy="${y - 5}" rx="2" ry="1.5" fill="#9be9a8" opacity="0">
            <animate attributeName="opacity" ${extAnim(sproutT + 0.2, 0.2, ["0", "0.8"])}/>
          </ellipse>
        </g>
      `);

      const grassT = t + 0.5;
      const bladeCount = Math.min(2 + day.level, 6);

      for (let i = 0; i < bladeCount; i++) {
        const bx = x + 1 + i * ((CELL_SIZE - 2) / Math.max(bladeCount - 1, 1));
        const bh = height * (0.5 + prand(seed, i) * 0.5);
        const sway = (i % 2 === 0 ? 1 : -1) * (1 + prand(seed, i + 10) * 3);
        const bt = grassT + i * 0.04;
        const swayStart = bt + GROW_TIME;
        const bladeColor = i % 3 === 0 ? darkerColor : i % 3 === 1 ? color : lighterColor;

        el.push(`
          <line x1="${bx}" y1="${y}" x2="${bx}" y2="${y}"
                stroke="${bladeColor}" stroke-width="${1.8 + prand(seed, i + 30) * 1.2}" stroke-linecap="round" opacity="0">
            <animate attributeName="opacity" ${extAnim(bt, 0.1, ["0", "0.85"])}/>
            <animate attributeName="y2" ${extAnimSpline(bt, GROW_TIME, [`${y}`, `${y - bh}`], ["0.05 0.9 0.25 1"])}/>
            <animate attributeName="x2"
                     values="${bx};${bx + sway};${bx}"
                     dur="${1.6 + prand(seed, i + 20) * 1.5}s" begin="cycle.begin+${swayStart}s" repeatCount="indefinite"/>
          </line>
        `);

        if (bh > 18) {
          const lt = bt + GROW_TIME * 0.55;
          el.push(`
            <path d="M ${bx},${y} Q ${bx + sway * 0.5},${y} ${bx},${y}" stroke="none"
                  fill="${bladeColor}" opacity="0">
              <animate attributeName="opacity" ${extAnim(lt, 0.25, ["0", "0.6"])}/>
              <animate attributeName="d"
                       ${extAnim(lt, 0.4, [
                         `M ${bx},${y - bh + 3} Q ${bx + sway * 0.3},${y - bh + 2} ${bx},${y - bh + 3}`,
                         `M ${bx - 3},${y - bh + 1} Q ${bx + sway * 0.5},${y - bh - 2} ${bx + 3},${y - bh + 1}`
                       ])}/>
            </path>
          `);
        }
      }

      if (day.level >= 3) {
        const bushT = grassT + GROW_TIME * 0.3;
        el.push(`
          <ellipse cx="${cx}" cy="${y - 2}" rx="0" ry="0" fill="${color}" opacity="0">
            <animate attributeName="opacity" ${extAnim(bushT, 0.3, ["0", "0.3"])}/>
            <animate attributeName="rx" ${extAnim(bushT, 0.5, ["0", `${CELL_SIZE / 2 + 1}`])}/>
            <animate attributeName="ry" ${extAnim(bushT, 0.5, ["0", "4"])}/>
          </ellipse>
        `);
      }

      if (day.level >= 4) {
        const fx = cx;
        const fy = y - height - 3;
        const ft = grassT + GROW_TIME + 0.1;

        el.push(`
          <line x1="${fx}" y1="${y - height + 5}" x2="${fx}" y2="${fy + 3}"
                stroke="#30a14e" stroke-width="1.2" opacity="0">
            <animate attributeName="opacity" ${extAnim(ft - 0.1, 0.3, ["0", "0.7"])}/>
          </line>
        `);

        el.push(`
          <g opacity="0">
            <animate attributeName="opacity" ${extAnim(ft, 0.4, ["0", "1"])}/>
            ${[0, 72, 144, 216, 288].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const px = fx + Math.cos(rad) * 3.5;
              const py = fy + Math.sin(rad) * 3.5;
              return `<circle cx="${px}" cy="${py}" r="2.5" fill="#ff6b9d" opacity="0.85"/>`;
            }).join("\n            ")}
            <circle cx="${fx}" cy="${fy}" r="2" fill="#ffd93d">
              <animate attributeName="r" values="1.8;2.5;1.8" dur="3s" begin="cycle.begin+${ft}s" repeatCount="indefinite"/>
            </circle>
          </g>
        `);
      }
    }
  }

  return el.join("\n");
}