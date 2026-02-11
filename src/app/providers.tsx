"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/theme";
import { AppShellLayout } from "@/components/layout/AppShellLayout";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      {isLoginPage ? children : <AppShellLayout>{children}</AppShellLayout>}
    </MantineProvider>
  );
}
