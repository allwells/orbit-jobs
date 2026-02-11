"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/theme";
import { AppShellLayout } from "@/components/layout/AppShellLayout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <AppShellLayout>{children}</AppShellLayout>
    </MantineProvider>
  );
}
