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
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface DashboardStats {
  totalJobs: number;
  pendingJobs: number;
  approvedJobs: number;
  postedJobs: number;
  rejectedJobs: number;
  lastScrape: {
    created_at: string;
    metadata: Record<string, unknown>;
  } | null;
  hasKeywords: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greetings = {
      late: ["Burning the midnight oil?", "Still awake?", "Late night hustle?"],
      morning: [
        "Good morning!",
        "Rise and shine!",
        "Let's capture some jobs!",
        "Ready to ship?",
      ],
      afternoon: [
        "Good afternoon!",
        "Keep the momentum!",
        "Productive day?",
        "Full steam ahead!",
      ],
      evening: [
        "Good evening!",
        "Time to automate!",
        "Wrapping up?",
        "Evening hustle!",
      ],
    };

    let options = greetings.evening;
    if (hour < 5) options = greetings.late;
    else if (hour < 12) options = greetings.morning;
    else if (hour < 17) options = greetings.afternoon;

    setGreeting(options[Math.floor(Math.random() * options.length)]);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const statCards = [
    {
      title: "Jobs Scraped",
      value: stats ? String(stats.totalJobs) : "—",
      icon: Briefcase,
      color: "indigo",
      description: stats
        ? stats.totalJobs > 0
          ? `${stats.pendingJobs} pending review`
          : "Awaiting first scrape"
        : "Loading...",
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
      value: stats ? String(stats.postedJobs) : "0",
      icon: Send,
      color: "teal",
      description:
        stats && stats.postedJobs > 0
          ? `${stats.approvedJobs} approved`
          : "Nothing posted yet",
    },
    {
      title: "Impressions",
      value: "—",
      icon: TrendingUp,
      color: "orange",
      description: "Connect X Analytics",
    },
  ];

  return (
    <Stack gap="md">
      {/* ── Header ──────────────────────────────── */}
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            {greeting}
          </Title>
          <Badge
            variant="gradient"
            gradient={{ from: "indigo", to: "violet" }}
            size="sm"
          >
            Phase 2
          </Badge>
        </Group>
        <Text c="dimmed" size="sm">
          Welcome to OrbitJobs. Your automated job-to-tweet pipeline starts
          here.
        </Text>
      </div>

      {/* ── Stats Grid ──────────────────────────── */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        {statCards.map((stat) => (
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
            <Text fz={40} fw={700}>
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
            {stats?.hasKeywords
              ? "Stealth scraper is configured and ready. Keywords are set up for LinkedIn job search."
              : "Configure scraping keywords in Settings to begin sourcing jobs automatically."}
          </Text>
          <Group mt="sm" gap="xs">
            {stats?.hasKeywords ? (
              <Badge variant="light" color="teal" size="sm">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" color="gray" size="sm">
                Not Configured
              </Badge>
            )}
            {stats?.lastScrape && (
              <Badge variant="light" color="gray" size="sm">
                Last run: {formatTimeAgo(stats.lastScrape.created_at)}
              </Badge>
            )}
          </Group>
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
