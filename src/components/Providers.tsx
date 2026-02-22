"use client";

import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { MantineProvider } from "@mantine/core";
import { getTheme } from "@/lib/theme";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import React from "react";

function MantineThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <MantineProvider
      theme={getTheme("dark")}
      defaultColorScheme="dark"
      forceColorScheme="dark"
    >
      <Notifications position="top-right" />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MantineThemeWrapper>{children}</MantineThemeWrapper>
    </ThemeProvider>
  );
}
