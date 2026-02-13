"use client";

import { Alert } from "@mantine/core";
import { Info } from "lucide-react";

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
  ScrollArea,
  Timeline,
  Loader,
} from "@mantine/core";
import {
  Briefcase,
  Zap,
  Send,
  TrendingUp,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { formatDate } from "@/utils/formatters";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
);

interface DashboardStats {
  totalJobs: number;
  pendingJobs: number;
  draftJobs: number;
  approvedJobs: number;
  postedJobs: number;
  rejectedJobs: number;
  lastScrape: {
    created_at: string;
    metadata: Record<string, unknown>;
  } | null;
  hasKeywords: boolean;
}

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface ScraperSettings {
  scraper_frequency?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [greeting, setGreeting] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [scraperSettings, setScraperSettings] =
    useState<ScraperSettings | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);

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

  const fetchActivityLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs?limit=10");
      const data = await res.json();
      setActivityLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchScraperSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setScraperSettings(data);
    } catch (error) {
      console.error("Failed to fetch scraper settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivityLogs();
    fetchScraperSettings();
  }, [fetchStats, fetchActivityLogs, fetchScraperSettings]);

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

  const calculateNextRun = () => {
    if (!stats?.lastScrape || !scraperSettings?.scraper_frequency) return null;
    const lastRun = new Date(stats.lastScrape.created_at);
    const freqMinutes = parseInt(scraperSettings.scraper_frequency);
    const nextRun = new Date(lastRun.getTime() + freqMinutes * 60000);
    return nextRun;
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "scrape":
        return <Briefcase size={16} />;
      case "ai_generate":
        return <Zap size={16} />;
      case "error":
        return <XCircle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "scrape":
        return "indigo";
      case "ai_generate":
        return "violet";
      case "error":
        return "red";
      default:
        return "gray";
    }
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
      value: stats ? String(stats.draftJobs) : "0",
      icon: Zap,
      color: "violet",
      description:
        (stats?.draftJobs ?? 0) > 0 ? "Ready to review" : "No drafts yet",
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

  // Chart data
  const jobStatusData = {
    labels: ["Pending", "Draft", "Approved", "Rejected"],
    datasets: [
      {
        label: "Jobs by Status",
        data: stats
          ? [
              stats.pendingJobs,
              stats.draftJobs,
              stats.approvedJobs,
              stats.rejectedJobs,
            ]
          : [0, 0, 0, 0],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(20, 184, 166, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(20, 184, 166, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Stack gap="md">
      {/* ── Read-Only Banner ────────────────────── */}
      <Alert
        variant="light"
        color="blue"
        title="Portfolio Demo Mode"
        icon={<Info size={16} />}
      >
        This application is running in a read-only portfolio mode. All backend
        mutations and 3rd-party integrations (Jobs Scraping, Gemini AI, X
        posting) are disabled. Feel free to explore the UI!
      </Alert>

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
            Phase 3
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

      {/* ── Charts & Next Run ───────────────────── */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Job Status Chart */}
        <Paper p="lg" radius="md" withBorder>
          <Text fw={600} mb="md">
            Job Pipeline Status
          </Text>
          <div style={{ height: 250 }}>
            <Doughnut
              data={jobStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </Paper>

        {/* Next Scraping Time */}
        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="teal" size="lg" radius="md">
              <Clock style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>Scraper Schedule</Text>
              <Text size="xs" c="dimmed">
                Automatic job discovery
              </Text>
            </div>
          </Group>

          <Stack gap="sm">
            {stats?.lastScrape && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Last Run
                </Text>
                <Text size="sm" fw={500}>
                  {formatDate(stats.lastScrape.created_at)}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatTimeAgo(stats.lastScrape.created_at)}
                </Text>
              </div>
            )}

            {calculateNextRun() && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Next Scheduled Run
                </Text>
                <Text size="sm" fw={600} c="teal">
                  {formatDate(calculateNextRun()!.toISOString())}
                </Text>
              </div>
            )}

            {scraperSettings?.scraper_frequency && (
              <div>
                <Text size="sm" c="dimmed" mb={4}>
                  Frequency
                </Text>
                <Badge variant="light" color="indigo">
                  Every{" "}
                  {parseInt(scraperSettings.scraper_frequency) >= 60
                    ? `${parseInt(scraperSettings.scraper_frequency) / 60} hour${parseInt(scraperSettings.scraper_frequency) / 60 > 1 ? "s" : ""}`
                    : `${scraperSettings.scraper_frequency} minutes`}
                </Badge>
              </div>
            )}

            {!stats?.lastScrape && (
              <Text size="sm" c="dimmed">
                No scraper runs yet. Configure keywords in Settings to start.
              </Text>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* ── Activity Logs & Pipeline Status ──────── */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        {/* Activity Logs */}
        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="gray" size="lg" radius="md">
              <Activity style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <div>
              <Text fw={600}>Recent Activity</Text>
              <Text size="xs" c="dimmed">
                System events and logs
              </Text>
            </div>
          </Group>

          {loadingLogs ? (
            <Group justify="center" p="xl">
              <Loader size="sm" />
            </Group>
          ) : activityLogs.length > 0 ? (
            <ScrollArea h={300}>
              <Timeline active={-1} bulletSize={24} lineWidth={2}>
                {activityLogs.map((log) => (
                  <Timeline.Item
                    key={log.id}
                    bullet={getLogIcon(log.type)}
                    title={
                      <Text size="sm" fw={500}>
                        {log.message}
                      </Text>
                    }
                    color={getLogColor(log.type)}
                  >
                    <Text size="xs" c="dimmed" mt={4}>
                      {formatTimeAgo(log.created_at)}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </ScrollArea>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No activity yet. Start by running the scraper.
            </Text>
          )}
        </Paper>

        {/* Pipeline Status Cards */}
        <Stack gap="md">
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
                  Stealth Scraper
                </Text>
              </div>
            </Group>
            <Text size="sm" c="dimmed">
              {stats?.hasKeywords
                ? "Stealth scraper is configured and ready. Keywords are set up for job search."
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
                  Gemini 2.0 Content Engine
                </Text>
              </div>
            </Group>
            <Text size="sm" c="dimmed">
              AI-powered tweet generation. Hook + reply threads with no links in
              the main tweet.
            </Text>
            <Badge mt="sm" variant="light" color="teal" size="sm">
              Active
            </Badge>
          </Paper>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
