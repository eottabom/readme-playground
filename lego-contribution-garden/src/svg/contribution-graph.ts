import { ContributionWeek } from "../contributions";
import { TOP_WEEKS, TOP_CELL, TOP_GAP, TOP_OFFSET_X, TOP_OFFSET_Y, TOP_COL_W } from "./constants";

export function generateTopContributionGraph(
  weeks: ContributionWeek[],
  gardenColors: string[],
  emptyColor: string,
  totalWidth: number
): string {
  const displayWeeks = weeks.slice(-TOP_WEEKS);
  const graphWidth = displayWeeks.length * TOP_COL_W;
  const offsetX = Math.max(TOP_OFFSET_X, (totalWidth - graphWidth) / 2);

  const cells: string[] = [];

  for (let w = 0; w < displayWeeks.length; w++) {
    const week = displayWeeks[w];
    for (let d = 0; d < week.days.length; d++) {
      const day = week.days[d];
      const x = offsetX + w * TOP_COL_W;
      const y = TOP_OFFSET_Y + d * (TOP_CELL + TOP_GAP);
      const color =
        day.level === 0
          ? emptyColor
          : gardenColors[day.level - 1] || emptyColor;

      cells.push(`
        <rect x="${x}" y="${y}" width="${TOP_CELL}" height="${TOP_CELL}" rx="2"
              fill="${color}">
          <title>${day.date}: ${day.count} contributions</title>
        </rect>
      `);
    }
  }

  return cells.join("\n");
}
