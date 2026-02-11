"use client";

import {
  createTheme,
  MantineColorsTuple,
  DEFAULT_THEME,
  mergeMantineTheme,
} from "@mantine/core";

// Electric Indigo color palette centered on #6366F1
const indigo: MantineColorsTuple = [
  "#eef2ff", // 0 - lightest
  "#e0e7ff", // 1
  "#c7d2fe", // 2
  "#a5b4fc", // 3
  "#818cf8", // 4
  "#6366f1", // 5 - primary brand color
  "#4f46e5", // 6
  "#4338ca", // 7
  "#3730a3", // 8
  "#312e81", // 9 - darkest
];

// Custom dark theme colors — overriding Mantine's dark palette
// so that the body/shell background resolves to #101010
const dark: MantineColorsTuple = [
  "#C1C2C5", // 0 - text
  "#A6A7AB", // 1
  "#909296", // 2
  "#5C5F66", // 3
  "#373A40", // 4
  "#2C2E33", // 5
  "#25262B", // 6 - card/surface
  "#1A1B1E", // 7 - elevated surface
  "#141414", // 8 - secondary background
  "#050505", // 9 - body background (#050505)
];

const themeOverride = createTheme({
  primaryColor: "indigo",
  colors: {
    indigo,
    dark,
  },
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  defaultRadius: "md",
  cursorType: "pointer",
  focusRing: "auto",

  other: {
    brandName: "OrbitJobs",
    xHandle: "@TheOrbitJobs",
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
