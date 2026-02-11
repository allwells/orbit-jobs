"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Stack,
  Divider,
  Menu,
  UnstyledButton,
  Avatar,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  BarChart3,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "../ThemeToggle";
import { Logo } from "../Logo";
import styles from "./AppShellLayout.module.css";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Job Queue", href: "/queue", icon: ListTodo },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();

  const handleNavigate = (href: string) => {
    router.push(href);
    close();
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
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
              <Logo size="h3" />
            </Group>
          </Group>

          <Group visibleFrom="sm" gap="xs">
            <ThemeToggle />
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8}>
                    <Avatar
                      src={null}
                      alt="Admin"
                      radius="xl"
                      size={36}
                      color="indigo"
                    >
                      <User size="1.2rem" />
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        Admin
                      </Text>
                      <Text c="dimmed" size="xs">
                        admin@orbitjobs.local
                      </Text>
                    </div>
                    <ChevronDown size={14} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={
                    <Settings style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() => handleNavigate("/settings")}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={
                    <LogOut style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
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

          <Stack gap="sm" align="center">
            {/* Mobile-only utility menu */}
            <Stack gap="xs" hiddenFrom="sm" w="100%">
              <NavLink
                label="Settings"
                leftSection={<Settings size={20} />}
                onClick={() => handleNavigate("/settings")}
                className={styles.navLink}
                variant="light"
              />
              <NavLink
                label="Logout"
                leftSection={<LogOut size={20} />}
                onClick={handleLogout}
                className={styles.navLink}
                c="red"
                variant="light"
              />
              <Group justify="center" mt="xs">
                <ThemeToggle />
              </Group>
              <Divider my="xs" />
            </Stack>

            <Text size="xs" c="dimmed" ta="center">
              <a
                href="https://x.com/TheOrbitJobs"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--mantine-color-dimmed)" }}
              >
                @TheOrbitJobs
              </a>
            </Text>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* ── Main Content ──────────────────────────── */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
