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
  TextInput,
} from "@mantine/core";
import {
  Settings,
  Search,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  Send,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/utils/formatters";
import { notifications } from "@mantine/notifications";

const FREQUENCY_OPTIONS = [
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every hour" },
  { value: "120", label: "Every 2 hours" },
  { value: "360", label: "Every 6 hours" },
  { value: "720", label: "Every 12 hours" },
  { value: "1440", label: "Every 24 hours" },
];

const LIMIT_OPTIONS = ["5", "10", "20", "40", "50", "70", "100"];

const GEMINI_MODELS = [
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Recommended)" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
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
  const [limit, setLimit] = useState<string | null>("20");
  const [model, setModel] = useState<string | null>("gemini-2.5-flash");
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
  const [telegramChatId, setTelegramChatId] = useState<string>("");
  const [testingTelegram, setTestingTelegram] = useState(false);

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
      if (settings.scraper_limit) {
        setLimit(settings.scraper_limit);
      }
      if (settings.gemini_model) {
        setModel(settings.gemini_model);
      }
      if (settings.telegram_chat_id) {
        setTelegramChatId(settings.telegram_chat_id);
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

  // Save limit
  const saveLimit = async (value: string | null) => {
    if (!value) return;
    setLimit(value);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "scraper_limit",
          value,
        }),
      });
    } catch (error) {
      console.error("Failed to save limit:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save model
  const saveModel = async (value: string | null) => {
    if (!value) return;
    setModel(value);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "gemini_model",
          value,
        }),
      });
    } catch (error) {
      console.error("Failed to save model:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save Telegram Chat ID
  const saveTelegramChatId = async () => {
    if (!telegramChatId.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "telegram_chat_id",
          value: telegramChatId.trim(),
        }),
      });
      notifications.show({
        title: "Saved",
        message: "Telegram Chat ID saved successfully",
        color: "teal",
      });
    } catch (error) {
      console.error("Failed to save Telegram Chat ID:", error);
      notifications.show({
        title: "Error",
        message: "Failed to save Telegram Chat ID",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  // Test Telegram notification
  const testTelegramNotification = async () => {
    if (!telegramChatId.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a Chat ID first",
        color: "red",
      });
      return;
    }
    setTestingTelegram(true);
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: telegramChatId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: "Success",
          message: "Test notification sent! Check your Telegram.",
          color: "teal",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to send test notification",
        color: "red",
      });
    } finally {
      setTestingTelegram(false);
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

      {/* ── AI Model Configuration ───────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Settings
            size={20}
            style={{ color: "var(--mantine-color-grape-6)" }}
          />
          <Text fw={600}>AI Brain Model</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          Select the Gemini model used for generating viral job tweets.
        </Text>
        <Select
          data={GEMINI_MODELS}
          value={model}
          onChange={saveModel}
          allowDeselect={false}
          w={300}
        />
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

      {/* ── Scraping Limit ───────────────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Settings
            size={20}
            style={{ color: "var(--mantine-color-orange-6)" }}
          />
          <Text fw={600}>Scraping Job Limit</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          Maximum number of jobs to scrape per run (up to 100).
        </Text>
        <Select
          data={LIMIT_OPTIONS}
          value={limit}
          onChange={saveLimit}
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

      {/* ── Telegram Notifications ──────────────────── */}
      <Paper p="lg" radius="md" withBorder>
        <Group gap="sm" mb="md">
          <Send size={20} style={{ color: "var(--mantine-color-blue-6)" }} />
          <Text fw={600}>Telegram Notifications</Text>
        </Group>
        <Text c="dimmed" size="sm" mb="md">
          Get notified on Telegram when new jobs are found. To get your Chat ID,
          message{" "}
          <Text
            component="a"
            href="https://t.me/userinfobot"
            target="_blank"
            c="blue"
            span
          >
            @userinfobot
          </Text>{" "}
          on Telegram.
        </Text>
        <Stack gap="md">
          <TextInput
            label="Telegram Chat ID"
            placeholder="-1234567890"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            description="Your Telegram user or group chat ID"
          />
          <Group>
            <Button
              onClick={saveTelegramChatId}
              loading={saving}
              disabled={!telegramChatId.trim()}
              variant="light"
            >
              Save Chat ID
            </Button>
            <Button
              onClick={testTelegramNotification}
              loading={testingTelegram}
              disabled={!telegramChatId.trim()}
              variant="outline"
              leftSection={<Send size={16} />}
            >
              Test Notification
            </Button>
          </Group>
        </Stack>
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
                <Group align="start" style={{ flexWrap: "nowrap" }}>
                  <Text size="sm" c="dimmed" w={120} style={{ flexShrink: 0 }}>
                    Last Run:
                  </Text>
                  <Text size="sm" style={{ wordBreak: "break-word" }}>
                    {formatDate(scraperStatus.lastRun.created_at)} |{" "}
                    {scraperStatus.lastRun.message}
                  </Text>
                </Group>
                {calculateNextRun() && (
                  <Group align="start" style={{ flexWrap: "nowrap" }}>
                    <Text size="sm" c="dimmed" w={120}>
                      Next Run:
                    </Text>
                    <Text
                      size="sm"
                      fw={600}
                      style={{ wordBreak: "break-word" }}
                    >
                      {formatDate(calculateNextRun()!.toISOString())}
                    </Text>
                  </Group>
                )}
              </>
            )}
            {scraperStatus.lastError && (
              <Group align="start" style={{ flexWrap: "nowrap" }}>
                <Text size="sm" c="dimmed" w={120} style={{ flexShrink: 0 }}>
                  Last Error:
                </Text>
                <Text size="sm" c="red" style={{ wordBreak: "break-word" }}>
                  {formatDate(scraperStatus.lastError.created_at)} |{" "}
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
