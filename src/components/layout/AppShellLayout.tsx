"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Stack,
  Divider,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  BarChart3,
  Orbit,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import styles from "./AppShellLayout.module.css";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job Queue", href: "/queue", icon: ListTodo },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();

  const handleNavigate = (href: string) => {
    router.push(href);
    close();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* ── Header ────────────────────────────────── */}
      <AppShell.Header className={styles.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group
              gap={8}
              className={styles.logo}
              onClick={() => handleNavigate("/")}
              style={{ cursor: "pointer" }}
            >
              <Orbit size={28} className={styles.logoIcon} />
              <Text
                size="lg"
                fw={700}
                variant="gradient"
                gradient={{ from: "indigo", to: "violet", deg: 135 }}
              >
                OrbitJobs
              </Text>
            </Group>
          </Group>

          <Box visibleFrom="sm">
            <ThemeToggle />
          </Box>
        </Group>
      </AppShell.Header>

      {/* ── Sidebar Nav ───────────────────────────── */}
      <AppShell.Navbar p="md" className={styles.navbar}>
        <AppShell.Section grow>
          <Stack gap={4}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  label={item.label}
                  leftSection={<item.icon size={20} />}
                  active={isActive}
                  onClick={() => handleNavigate(item.href)}
                  className={styles.navLink}
                  variant="light"
                />
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Stack gap="xs" align="center">
            <Box hiddenFrom="sm">
              <ThemeToggle />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
              @TheOrbitJobs
            </Text>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ── Main Content ──────────────────────────── */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
