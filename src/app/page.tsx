"use client";

import {
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  rem,
} from "@mantine/core";
import { Briefcase, Zap, Send, TrendingUp } from "lucide-react";
import styles from "./page.module.css";

const stats = [
  {
    title: "Jobs Scraped",
    value: "0",
    icon: Briefcase,
    color: "indigo",
    description: "Awaiting first scrape",
  },
  {
    title: "AI Drafts Ready",
    value: "0",
    icon: Zap,
    color: "violet",
    description: "No drafts yet",
  },
  {
    title: "Posts Published",
    value: "0",
    icon: Send,
    color: "teal",
    description: "Nothing posted yet",
  },
  {
    title: "Impressions",
    value: "—",
    icon: TrendingUp,
    color: "orange",
    description: "Connect X Analytics",
  },
];

export default function DashboardPage() {
  return (
    <Stack gap="lg">
      {/* ── Header ──────────────────────────────── */}
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            Command Center
          </Title>
          <Badge
            variant="gradient"
            gradient={{ from: "indigo", to: "violet" }}
            size="sm"
          >
            Phase 1
          </Badge>
        </Group>
        <Text c="dimmed" size="sm">
          Welcome to OrbitJobs. Your automated job-to-tweet pipeline starts
          here.
        </Text>
      </div>

      {/* ── Stats Grid ──────────────────────────── */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        {stats.map((stat) => (
          <Paper
            key={stat.title}
            p="md"
            radius="md"
            className={styles.statCard}
            withBorder
          >
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {stat.title}
              </Text>
              <ThemeIcon
                variant="light"
                color={stat.color}
                size="lg"
                radius="md"
              >
                <stat.icon style={{ width: rem(18), height: rem(18) }} />
              </ThemeIcon>
            </Group>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {stat.description}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* ── Pipeline Status ─────────────────────── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="lg" radius="md" withBorder className={styles.featureCard}>
          <Group gap="sm" mb="sm">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "indigo", to: "violet" }}
              size="lg"
              radius="md"
            >
              <Briefcase style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>The Seeker</Text>
              <Text size="xs" c="dimmed">
                LinkedIn Stealth Scraper
              </Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed">
            Phase 2 — Configure scraping keywords and frequency to begin
            sourcing high-paying tech jobs automatically.
          </Text>
          <Badge mt="sm" variant="outline" color="gray" size="sm">
            Coming Soon
          </Badge>
        </Paper>

        <Paper p="lg" radius="md" withBorder className={styles.featureCard}>
          <Group gap="sm" mb="sm">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "violet", to: "grape" }}
              size="lg"
              radius="md"
            >
              <Zap style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>The Brain</Text>
              <Text size="xs" c="dimmed">
                Gemini Pro Content Engine
              </Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed">
            Phase 3 — AI-powered tweet generation. Hook + reply threads with no
            links in the main tweet.
          </Text>
          <Badge mt="sm" variant="outline" color="gray" size="sm">
            Coming Soon
          </Badge>
        </Paper>

        <Paper p="lg" radius="md" withBorder className={styles.featureCard}>
          <Group gap="sm" mb="sm">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "teal", to: "cyan" }}
              size="lg"
              radius="md"
            >
              <Send style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>The Messenger</Text>
              <Text size="xs" c="dimmed">
                Telegram Notifications
              </Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed">
            Phase 4 — Get instant alerts on Telegram with deep links to review
            new jobs from your phone.
          </Text>
          <Badge mt="sm" variant="outline" color="gray" size="sm">
            Coming Soon
          </Badge>
        </Paper>

        <Paper p="lg" radius="md" withBorder className={styles.featureCard}>
          <Group gap="sm" mb="sm">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "orange", to: "red" }}
              size="lg"
              radius="md"
            >
              <TrendingUp style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>The Command Center</Text>
              <Text size="xs" c="dimmed">
                Post & Analyze
              </Text>
            </div>
          </Group>
          <Text size="sm" c="dimmed">
            Phase 5 — Review, edit, and publish. Manual copy or semi-automated X
            posting with rate-limit tracking.
          </Text>
          <Badge mt="sm" variant="outline" color="gray" size="sm">
            Coming Soon
          </Badge>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
