// Top contribution graph (compact, background)
export const TOP_WEEKS = 52;
export const TOP_CELL = 10;
export const TOP_GAP = 2;
export const TOP_OFFSET_X = 50;
export const TOP_OFFSET_Y = 60;
export const TOP_COL_W = TOP_CELL + TOP_GAP;

// Bottom garden (interactive, animated)
export const gardenConfig = { weeks: 20 };

export function setGardenWeeks(weeks: number): void {
  gardenConfig.weeks = Math.max(4, Math.min(52, weeks));
}

export function getGardenWeeks(): number {
  return gardenConfig.weeks;
}
export const CELL_SIZE = 14;
export const CELL_GAP = 3;
export const COL_W = CELL_SIZE + CELL_GAP;

// Animation timing
export const WALK_DURATION = 14;
export const GROW_TIME = 1.0;
export const FULL_CYCLE = WALK_DURATION + 3;

export const GRASS_HEIGHTS = [0, 14, 26, 40, 55];

export const DEFAULT_OPTIONS = {
  legoColor: "#FFD700",
  gardenColorEmpty: "#ebedf0",
  gardenColors: ["#9be9a8", "#40c463", "#30a14e", "#216e39"],
  waterColor: "#56c4f5",
  backgroundColor: "#ffffff",
  showTotal: true,
};

export function getGrassHeight(level: number): number {
  return GRASS_HEIGHTS[level] ?? 0;
}

export function arriveTime(weekIndex: number): number {
  return (weekIndex / getGardenWeeks()) * WALK_DURATION;
}

export function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function prand(seed: number, i: number): number {
  const v = Math.sin(seed * 9301 + i * 4973) * 10000;
  return v - Math.floor(v);
}

export function trapezoidPath(x: number, y: number, w: number, h: number, inset: number): string {
  return `M ${x + inset},${y} L ${x + w - inset},${y} L ${x + w},${y + h} L ${x},${y + h} Z`;
}

/**
 * Create a self-repeating animation synced to the full cycle.
 * Uses begin="cycle.begin" + dur=FULL_CYCLE + repeatCount="indefinite"
 * with keyTimes encoding the delay and reset phases.
 *
 * cycle.begin only fires ONCE in SVG SMIL (not on each repeat),
 * so each animation must self-repeat with its own repeatCount="indefinite".
 */
export function extAnim(
  startSec: number, durSec: number, vals: string[], origKT?: number[]
): string {
  const init = vals[0];
  const fin = vals[vals.length - 1];
  const n = vals.length;
  const kt = origKT || vals.map((_, i) => i / Math.max(n - 1, 1));
  // Reset point: wrapper is invisible by 0.941, use 0.95 for safety
  const RESET_T = 0.95;

  const outKT: number[] = [0];
  const outV: string[] = [init];

  // Map original animation keyTimes to cycle time
  for (let i = 0; i < n; i++) {
    const t = parseFloat(((startSec + kt[i] * durSec) / FULL_CYCLE).toFixed(4));
    if (t > outKT[outKT.length - 1] + 0.0001) {
      outKT.push(t);
      outV.push(vals[i]);
    }
  }

  // If final value differs from initial, add hold + reset
  if (fin !== init) {
    if (RESET_T > outKT[outKT.length - 1] + 0.0001) {
      outKT.push(RESET_T);
      outV.push(fin);
    }
    const resetEnd = parseFloat((RESET_T + 0.005).toFixed(4));
    if (resetEnd < 1 - 0.0001) {
      outKT.push(resetEnd);
      outV.push(init);
    }
  }

  // End at initial
  if (outKT[outKT.length - 1] < 1 - 0.0001) {
    outKT.push(1);
    outV.push(init);
  }

  return `values="${outV.join(";")}" keyTimes="${outKT.join(";")}" dur="${FULL_CYCLE}s" begin="cycle.begin" repeatCount="indefinite"`;
}

/**
 * Create a self-repeating spline animation synced to the full cycle.
 * Adds linear keySplines for hold/reset segments.
 */
export function extAnimSpline(
  startSec: number, durSec: number, vals: string[], splines: string[], origKT?: number[]
): string {
  const init = vals[0];
  const fin = vals[vals.length - 1];
  const n = vals.length;
  const kt = origKT || vals.map((_, i) => i / Math.max(n - 1, 1));
  const RESET_T = 0.95;
  const LIN = "0 0 1 1";

  const outKT: number[] = [0];
  const outV: string[] = [init];
  const outS: string[] = [];

  // Map original animation keyTimes with original splines
  for (let i = 0; i < n; i++) {
    const t = parseFloat(((startSec + kt[i] * durSec) / FULL_CYCLE).toFixed(4));
    if (t > outKT[outKT.length - 1] + 0.0001) {
      outKT.push(t);
      outV.push(vals[i]);
      outS.push(i === 0 ? LIN : splines[i - 1]);
    }
  }

  // Hold final + reset
  if (fin !== init) {
    if (RESET_T > outKT[outKT.length - 1] + 0.0001) {
      outKT.push(RESET_T);
      outV.push(fin);
      outS.push(LIN);
    }
    const resetEnd = parseFloat((RESET_T + 0.005).toFixed(4));
    if (resetEnd < 1 - 0.0001) {
      outKT.push(resetEnd);
      outV.push(init);
      outS.push(LIN);
    }
  }

  // End at initial
  if (outKT[outKT.length - 1] < 1 - 0.0001) {
    outKT.push(1);
    outV.push(init);
    outS.push(LIN);
  }

  return `values="${outV.join(";")}" keyTimes="${outKT.join(";")}" keySplines="${outS.join(";")}" calcMode="spline" dur="${FULL_CYCLE}s" begin="cycle.begin" repeatCount="indefinite"`;
}
