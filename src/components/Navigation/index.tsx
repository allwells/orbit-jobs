"use client";

import {
  AppShell,
  Burger,
  Group,
  Text,
  Box,
  ScrollArea,
  Menu,
  Avatar,
  UnstyledButton,
  Stack,
  useMantineTheme,
  Container,
} from "@mantine/core";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Briefcase,
  ChartBar,
  Settings,
  LogOut as Logout,
  Activity as ActivityIcon,
} from "lucide-react";
import { Logo } from "../Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const mainLinks = [
  { link: "/dashboard", label: "Dashboard", icon: Home },
  { link: "/jobs", label: "Jobs", icon: Briefcase },
  { link: "/activity", label: "Activity", icon: ActivityIcon },
  { link: "/analytics", label: "Analytics", icon: ChartBar },
];

export function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useMantineTheme();
  const { user, logout } = useAuth();
  const [opened, { toggle }] = useDisclosure();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLink = (item: any) => {
    const isActive =
      pathname === item.link ||
      (item.link !== "/dashboard" && pathname.startsWith(item.link));

    return (
      <Link
        href={item.link}
        key={item.label}
        style={{ textDecoration: "none" }}
      >
        <UnstyledButton
          w="100%"
          py={8}
          px={12}
          mb={2}
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 0,
            backgroundColor: isActive
              ? theme.other.background.hover
              : "transparent",
            color: isActive
              ? theme.other.text.primary
              : theme.other.text.secondary,
            transition: "background-color 0s, color 0s",
            opacity: isActive ? 1 : 0.8,
            border: isActive
              ? `2px solid ${theme.other.border.strong}`
              : "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor =
                theme.other.background.hover;
              e.currentTarget.style.color = theme.other.text.primary;
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.border = `1px solid ${theme.other.border.default}`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.other.text.secondary;
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.border = "1px solid transparent";
            }
          }}
        >
          <item.icon size={18} strokeWidth={1.5} />
          <Text
            size="sm"
            fw={700}
            ml={12}
            tt="uppercase"
            style={{
              color: isActive
                ? theme.other.text.primary
                : theme.other.text.secondary,
            }}
          >
            {item.label}
          </Text>
        </UnstyledButton>
      </Link>
    );
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <AppShell
      header={{ height: 48 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      px={{ base: "md", lg: "lg", xl: "xl" }}
      py={{ base: "lg", xl: "xl" }}
      style={{ backgroundColor: theme.other.background.page }}
    >
      <AppShell.Header
        style={{
          backgroundColor: theme.other.background.secondary,
          borderBottom: `2px solid ${theme.other.border.sidebar}`,
          display: "flex",
        }}
      >
        <Box
          h="100%"
          px={{ base: "xs", lg: "md" }}
          w={{ base: "fit-content", lg: 250 }}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Logo size="lg" />
        </Box>

        <Group
          justify="end"
          align="center"
          style={{ flex: 1 }}
          px="md"
          h="100%"
        >
          <Group align="center" gap="xs">
            <Menu shadow="md" width={230} position="bottom-end">
              <Menu.Target>
                <UnstyledButton ml={8}>
                  <Box
                    style={{
                      color: theme.other.text.primary,
                      backgroundColor: theme.other.background.tertiary,
                      borderRadius: 0,
                    }}
                    p={8}
                  >
                    <Text size="xs" fw={700}>
                      {userInitials}
                    </Text>
                  </Box>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                {/* User Info in Dropdown */}
                <Box p="sm">
                  <Text size="sm" fw={700}>
                    {user?.name || "Admin"}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user?.email || ""}
                  </Text>
                </Box>

                <Menu.Divider />

                <Menu.Item
                  href="/settings"
                  component={Link}
                  leftSection={<Settings size={14} />}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      theme.other.background.hover;
                    e.currentTarget.style.color = theme.other.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.other.text.secondary;
                  }}
                >
                  Settings
                </Menu.Item>

                <Menu.Item
                  color="red"
                  onClick={() => logout()}
                  leftSection={<Logout size={14} />}
                  style={{
                    color: theme.other.error.text,
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              mr="xs"
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: theme.other.background.secondary,
          borderRight: `2px solid ${theme.other.border.sidebar}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppShell.Section grow component={ScrollArea}>
          <Stack gap={4}>{mainLinks.map(renderLink)}</Stack>
        </AppShell.Section>

        <AppShell.Section
          pt="md"
          mt="md"
          style={{
            borderTop: `2px solid ${theme.other.border.sidebar}`,
          }}
        >
          <Group justify="center">
            <ThemeToggle />
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container fluid style={{ maxWidth: 1920, height: "100%" }} p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
