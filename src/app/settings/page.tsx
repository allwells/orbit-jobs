"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Badge,
  Group,
  TagsInput,
  Select,
  Button,
  Divider,
  Notification,
  Loader,
  rem,
} from "@mantine/core";
import {
  Settings,
  Search,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const FREQUENCY_OPTIONS = [
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "120", label: "Every 2 hours" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours" },
  { value: "1440", label: "Every 24 hours" },
];

interface ScraperStatus {
  lastRun: {
    message: string;
    metadata: Record<string, unknown>;
    created_at: string;
  } | null;
  totalJobs: number;
  pendingJobs: number;
  lastError: {
    message: string;
    created_at: string;
  } | null;
}

export default function SettingsPage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string | null>("60");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(
    null,
  );

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    try {
      const [settingsRes, statusRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/scraper/status"),
      ]);
      const settings = await settingsRes.json();
      const status = await statusRes.json();

      if (settings.scraper_keywords) {
        try {
          setKeywords(JSON.parse(settings.scraper_keywords));
        } catch {
          setKeywords([]);
        }
      }
      if (settings.scraper_frequency) {
        setFrequency(settings.scraper_frequency);
      }
      setScraperStatus(status);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save keywords
  const saveKeywords = async (newKeywords: string[]) => {
    setKeywords(newKeywords);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "scraper_keywords",
          value: JSON.stringify(newKeywords),
        }),
      });
    } catch (error) {
      console.error("Failed to save keywords:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save frequency
  const saveFrequency = async (value: string | null) => {
    if (!value) return;
    setFrequency(value);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "scraper_frequency",
          value,
        }),
      });
    } catch (error) {
      console.error("Failed to save frequency:", error);
    } finally {
      setSaving(false);
    }
  };

  // Trigger manual scrape
  const runScraper = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch("/api/scraper/run", { method: "POST" });
      const result = await res.json();

      if (result.success) {
        setScrapeResult({
          type: "success",
          message: `Found ${result.jobsFound} jobs, ${result.jobsInserted} new jobs added.`,
        });
      } else {
        setScrapeResult({
          type: "error",
          message: result.error || "Scraper failed",
        });
      }

      // Refresh status
      const statusRes = await fetch("/api/scraper/status");
      setScraperStatus(await statusRes.json());
    } catch (error) {
      setScrapeResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to run scraper",
      });
    } finally {
      setScraping(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const calculateNextRun = () => {
    if (!scraperStatus?.lastRun || !frequency) return null;
    const lastRun = new Date(scraperStatus.lastRun.created_at);
    const freqMinutes = parseInt(frequency);
    const nextRun = new Date(lastRun.getTime() + freqMinutes * 60000);
    return nextRun;
  };

  if (loading) {
    return (
      <Stack gap="lg" align="center" justify="center" mih={400}>
        <Loader color="indigo" />
        <Text c="dimmed" size="sm">
          Loading settings...
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            Settings
          </Title>
          <Badge variant="light" color="indigo" size="sm">
            The Seeker
          </Badge>
          {saving && (
            <Badge variant="light" color="gray" size="xs">
              Saving...
            </Badge>
          )}
        </Group>
        <Text c="dimmed" size="sm">
          Configure scraping keywords, frequency, and trigger manual scrapes.
        </Text>
      </div>

      {/* ── Scraper Keywords ─────────────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Search
            size={20}
            style={{ color: "var(--mantine-color-indigo-6)" }}
          />
          <Text fw={600}>Scraper Keywords</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          Add keywords to search for on LinkedIn. The scraper combines them with
          OR logic.
        </Text>
        <TagsInput
          placeholder="Type a keyword and press Enter"
          value={keywords}
          onChange={saveKeywords}
          data={[]}
          maxTags={20}
          clearable
        />
        <Text c="dimmed" size="xs" mt="xs">
          {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} configured
        </Text>
      </Paper>

      {/* ── Scraping Frequency ───────────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Clock size={20} style={{ color: "var(--mantine-color-violet-6)" }} />
          <Text fw={600}>Scraping Frequency</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          How often the scraper should automatically check for new jobs.
        </Text>
        <Select
          data={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={saveFrequency}
          allowDeselect={false}
          w={300}
        />
      </Paper>

      {/* ── Manual Scrape ────────────────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Play size={20} style={{ color: "var(--mantine-color-teal-6)" }} />
          <Text fw={600}>Manual Scrape</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          Trigger an immediate scrape with the current keywords.
        </Text>

        {scrapeResult && (
          <Notification
            icon={
              scrapeResult.type === "success" ? (
                <CheckCircle style={{ width: rem(18), height: rem(18) }} />
              ) : (
                <AlertCircle style={{ width: rem(18), height: rem(18) }} />
              )
            }
            color={scrapeResult.type === "success" ? "teal" : "red"}
            title={
              scrapeResult.type === "success"
                ? "Scrape Complete"
                : "Scrape Failed"
            }
            onClose={() => setScrapeResult(null)}
            withCloseButton
            radius="md"
            mb="md"
          >
            {scrapeResult.message}
          </Notification>
        )}

        <Button
          onClick={runScraper}
          loading={scraping}
          color="indigo"
          leftSection={<Play size={16} />}
          disabled={keywords.length === 0}
        >
          {scraping ? "Scraping..." : "Run Scraper"}
        </Button>

        {keywords.length === 0 && (
          <Text c="dimmed" size="xs" mt="xs">
            Add at least one keyword above to enable scraping.
          </Text>
        )}
      </Paper>

      {/* ── Scraper Status ───────────────────────── */}
      {scraperStatus && (
        <Paper p="lg" radius="md" withBorder>
          <Group gap="sm" mb="md">
            <Info size={20} style={{ color: "var(--mantine-color-gray-6)" }} />
            <Text fw={600}>Scraper Status</Text>
          </Group>

          <Divider mb="md" />

          <Stack gap="xs">
            <Group>
              <Text size="sm" c="dimmed" w={120}>
                Total Jobs:
              </Text>
              <Text size="sm" fw={600}>
                {scraperStatus.totalJobs}
              </Text>
            </Group>
            <Group>
              <Text size="sm" c="dimmed" w={120}>
                Pending Review:
              </Text>
              <Text size="sm" fw={600}>
                {scraperStatus.pendingJobs}
              </Text>
            </Group>
            {scraperStatus.lastRun && (
              <>
                <Group>
                  <Text size="sm" c="dimmed" w={120}>
                    Last Run:
                  </Text>
                  <Text size="sm">
                    {formatDate(scraperStatus.lastRun.created_at)} —{" "}
                    {scraperStatus.lastRun.message}
                  </Text>
                </Group>
                {calculateNextRun() && (
                  <Group>
                    <Text size="sm" c="dimmed" w={120}>
                      Next Run:
                    </Text>
                    <Text size="sm" fw={600} c="teal">
                      {formatDate(calculateNextRun()!.toISOString())}
                    </Text>
                  </Group>
                )}
              </>
            )}
            {scraperStatus.lastError && (
              <Group>
                <Text size="sm" c="dimmed" w={120}>
                  Last Error:
                </Text>
                <Text size="sm" c="red">
                  {formatDate(scraperStatus.lastError.created_at)} —{" "}
                  {scraperStatus.lastError.message}
                </Text>
              </Group>
            )}
            {!scraperStatus.lastRun && !scraperStatus.lastError && (
              <Text size="sm" c="dimmed">
                No scraper runs yet. Click &quot;Run Scraper&quot; to start.
              </Text>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
