import { StreakResult } from "./streak";
import { Theme } from "./themes";

export interface CardOptions {
  username: string;
  streak: StreakResult;
  theme: Theme;
  locale: string;
  hideTitle?: boolean;
}

const LABELS: Record<string, { current: string; longest: string; days: string }> = {
  en: { current: "Current Streak", longest: "Longest Streak", days: "days" },
  ko: { current: "현재 스트릭", longest: "최장 스트릭", days: "일" },
};

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (locale === "ko") {
    return `${month}월 ${day}일`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${day}, ${year}`;
}

function formatDateRange(start: string, end: string, locale: string): string {
  if (!start || !end) return "-";
  if (start === end) return formatDate(start, locale);
  // For ranges, use shorter format without year
  const [, sm, sd] = start.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  if (locale === "ko") {
    return `${sm}월 ${sd}일 - ${em}월 ${ed}일`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[sm - 1]} ${sd} - ${months[em - 1]} ${ed}`;
}

function flamePath(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x}, ${y}) scale(${scale})">
    <path d="M12 0.5C10 4 4.5 7 4.5 13.5C4.5 17.6 7.9 21 12 21C16.1 21 19.5 17.6 19.5 13.5C19.5 7 14 4 12 0.5Z" fill="${color}" opacity="0.9"/>
    <path d="M12 6C11 8.5 8 10.5 8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14C16 10.5 13 8.5 12 6Z" fill="${color}" opacity="0.6"/>
    <path d="M12 10C11.3 11.5 10 12.8 10 14.5C10 15.6 10.9 16.5 12 16.5C13.1 16.5 14 15.6 14 14.5C14 12.8 12.7 11.5 12 10Z" fill="#FFF3E0" opacity="0.8"/>
  </g>`;
}

function trophyPath(x: number, y: number, scale: number, color: string): string {
  return `<g transform="translate(${x}, ${y}) scale(${scale})">
    <path d="M5 3H19V5H20C21.1 5 22 5.9 22 7V8C22 9.65 20.87 11.05 19.35 11.45C18.55 13.54 16.65 15.08 14.35 15.45L15 17H17V19H7V17H9L9.65 15.45C7.35 15.08 5.45 13.54 4.65 11.45C3.13 11.05 2 9.65 2 8V7C2 5.9 2.9 5 4 5H5V3ZM5 7H4V8C4 8.63 4.4 9.16 4.94 9.38C4.97 8.55 5 7.73 5 7ZM19 7V8C19 8.63 18.6 9.16 18.06 9.38C18.03 8.55 19 7.73 19 7ZM12 13C14.21 13 16 11.21 16 9V5H8V9C8 11.21 9.79 13 12 13Z" fill="${color}" opacity="0.85"/>
  </g>`;
}

export function generateStreakCard(options: CardOptions): string {
  const { username, streak, theme, locale, hideTitle } = options;
  const labels = LABELS[locale] ?? LABELS["en"];

  const WIDTH = 450;
  const TITLE_HEIGHT = hideTitle ? 0 : 40;
  const CONTENT_HEIGHT = 130;
  const HEIGHT = TITLE_HEIGHT + CONTENT_HEIGHT;
  const COL_CENTER_1 = WIDTH / 4;         // 112.5
  const COL_CENTER_2 = (WIDTH * 3) / 4;   // 337.5
  const DIVIDER_X = WIDTH / 2;

  const currentDays = streak.currentStreak;
  const longestDays = streak.longestStreak;
  const currentRange = formatDateRange(streak.currentStreakStart, streak.currentStreakEnd, locale);
  const longestRange = formatDateRange(streak.longestStreakStart, streak.longestStreakEnd, locale);

  const ff = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
  const titleStyle = `${ff}; font-size: 14px; font-weight: 600; fill: ${theme.title}`;
  const valueStyle = (color: string) => `${ff}; font-size: 32px; font-weight: 700; fill: ${color}`;
  const labelStyle = `${ff}; font-size: 12px; font-weight: 500; fill: ${theme.label}`;
  const dateStyle = `${ff}; font-size: 10px; font-weight: 400; fill: ${theme.dateRange}`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="6" ry="6"
        fill="${theme.background}" stroke="${theme.border}" stroke-width="1"/>`;

  // Title
  if (!hideTitle) {
    svg += `
  <text x="${WIDTH / 2}" y="26" text-anchor="middle" style="${titleStyle}">${escapeXml(username)}&apos;s Streak Stats</text>
  <line x1="20" y1="${TITLE_HEIGHT - 2}" x2="${WIDTH - 20}" y2="${TITLE_HEIGHT - 2}"
        stroke="${theme.border}" stroke-opacity="0.4"/>`;
  }

  const contentY = TITLE_HEIGHT + 10;

  // Column 1: Current Streak (with flame icon)
  svg += `
  <g transform="translate(${COL_CENTER_1}, ${contentY})">
    ${flamePath(-12, -2, 0.9, theme.accent)}
    <text x="0" y="48" text-anchor="middle" style="${valueStyle(theme.accent)}">${currentDays}</text>
    <text x="0" y="70" text-anchor="middle" style="${labelStyle}">${labels.current}</text>
    <text x="0" y="88" text-anchor="middle" style="${dateStyle}">${escapeXml(currentRange)}</text>
  </g>`;

  // Vertical divider
  svg += `
  <line x1="${DIVIDER_X}" y1="${TITLE_HEIGHT + 12}" x2="${DIVIDER_X}" y2="${HEIGHT - 12}"
        stroke="${theme.border}" stroke-opacity="0.25"/>`;

  // Column 2: Longest Streak (with trophy icon)
  svg += `
  <g transform="translate(${COL_CENTER_2}, ${contentY})">
    ${trophyPath(-12, -2, 0.9, theme.accent)}
    <text x="0" y="48" text-anchor="middle" style="${valueStyle(theme.value)}">${longestDays}</text>
    <text x="0" y="70" text-anchor="middle" style="${labelStyle}">${labels.longest}</text>
    <text x="0" y="88" text-anchor="middle" style="${dateStyle}">${escapeXml(longestRange)}</text>
  </g>`;

  svg += `
</svg>`;

  return svg;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
