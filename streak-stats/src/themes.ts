export interface Theme {
  background: string;
  border: string;
  title: string;
  label: string;
  value: string;
  dateRange: string;
  accent: string;
}

export const THEMES: Record<string, Theme> = {
  default: {
    background: "#ffffff",
    border: "#e4e2e2",
    title: "#24292f",
    label: "#57606a",
    value: "#24292f",
    dateRange: "#8b949e",
    accent: "#fb8c00",
  },
  dark: {
    background: "#0d1117",
    border: "#30363d",
    title: "#c9d1d9",
    label: "#8b949e",
    value: "#c9d1d9",
    dateRange: "#6e7681",
    accent: "#fb8c00",
  },
  radical: {
    background: "#141321",
    border: "#2d2b55",
    title: "#a9fef7",
    label: "#a9fef7",
    value: "#fe428e",
    dateRange: "#a9fef7",
    accent: "#fe428e",
  },
  tokyonight: {
    background: "#1a1b27",
    border: "#38bdae",
    title: "#70a5fd",
    label: "#a9b1d6",
    value: "#bf91f3",
    dateRange: "#6e7681",
    accent: "#70a5fd",
  },
  gruvbox: {
    background: "#282828",
    border: "#3c3836",
    title: "#ebdbb2",
    label: "#a89984",
    value: "#ebdbb2",
    dateRange: "#928374",
    accent: "#fabd2f",
  },
};

export function resolveTheme(
  themeName: string,
  overrides: Partial<Theme>
): Theme {
  const base = THEMES[themeName] ?? THEMES["default"];
  return { ...base, ...stripEmpty(overrides) };
}

function stripEmpty(obj: Partial<Theme>): Partial<Theme> {
  const result: Partial<Theme> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value) {
      (result as Record<string, string>)[key] = value;
    }
  }
  return result;
}
