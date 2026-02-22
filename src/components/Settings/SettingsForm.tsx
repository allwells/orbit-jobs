"use client";

import {
  Paper,
  Text,
  Select,
  Button,
  Group,
  Stack,
  Divider,
  Switch,
  Alert,
  Tabs,
  Slider,
  NumberInput,
  TextInput,
  Badge,
  Modal,
  Avatar,
  ActionIcon,
  Title,
} from "@mantine/core";
import {
  Send,
  Twitter,
  Bot,
  Search,
  User,
  Trash2,
  RefreshCw,
  LogOut,
  Settings,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { updateSettingAction } from "@/app/actions/settings-actions";
import {
  verifyXConnectionAction,
  upsertDefaultJobFetchConfigAction,
} from "@/app/actions/settings-utils-actions";
import {
  clearPostedJobsAction,
  resetAllSettingsAction,
} from "@/app/actions/data-management-actions";
import { RateLimitTracker } from "@/components/Settings/RateLimitTracker";
import { useDisclosure } from "@mantine/hooks";
import { authClient } from "@/lib/auth-client";

interface SettingsFormProps {
  initialSettings: Record<string, any>;
  initialJobFetchConfig: any;
  user: {
    id: string;
    username: string;
    email?: string;
  };
}

export function SettingsForm({
  initialSettings,
  initialJobFetchConfig,
  user,
}: SettingsFormProps) {
  const router = useRouter();

  // AI Settings
  const [aiModel, setAiModel] = useState<string | null>(
    initialSettings.default_ai_model || "gpt-4o",
  );
  const [aiTemp, setAiTemp] = useState<number>(
    initialSettings.ai_temperature || 0.7,
  );
  const [aiMaxTokens, setAiMaxTokens] = useState<number | string>(
    initialSettings.ai_max_tokens || 2000,
  );

  // Job Fetch Settings
  const [searchQuery, setSearchQuery] = useState(
    initialJobFetchConfig?.search_query || "",
  );
  const [location, setLocation] = useState(
    initialJobFetchConfig?.location || "",
  );
  const [salaryMin, setSalaryMin] = useState<number | string>(
    initialJobFetchConfig?.salary_min || 0,
  );
  const [remoteOnly, setRemoteOnly] = useState(
    initialJobFetchConfig?.remote_only || false,
  );

  // States
  const [saving, setSaving] = useState(false);
  const [testingX, setTestingX] = useState(false);
  const [xStatus, setXStatus] = useState<"unknown" | "connected" | "error">(
    "unknown",
  );
  const [testingTelegram, setTestingTelegram] = useState(false);

  // Modals
  const [clearJobsOpened, { open: openClearJobs, close: closeClearJobs }] =
    useDisclosure(false);
  const [
    resetSettingsOpened,
    { open: openResetSettings, close: closeResetSettings },
  ] = useDisclosure(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSaveAISettings = async () => {
    setSaving(true);
    try {
      await updateSettingAction("default_ai_model", aiModel);
      await updateSettingAction("ai_temperature", aiTemp);
      await updateSettingAction("ai_max_tokens", Number(aiMaxTokens));
      notifications.show({
        title: "Success",
        message: "AI Settings saved",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to save settings",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFetchSettings = async () => {
    setSaving(true);
    try {
      await upsertDefaultJobFetchConfigAction({
        search_query: searchQuery,
        location: location,
        remote_only: remoteOnly,
        salary_min: Number(salaryMin),
      });
      notifications.show({
        title: "Success",
        message: "Fetch Config saved",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to save config",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const testXConnection = async () => {
    setTestingX(true);
    try {
      const res = await verifyXConnectionAction();
      if (res.success) {
        setXStatus("connected");
        notifications.show({
          title: "Success",
          message: res.message,
          color: "green",
        });
      } else {
        setXStatus("error");
        notifications.show({
          title: "Error",
          message: res.message,
          color: "red",
        });
      }
    } catch (e) {
      setXStatus("error");
    } finally {
      setTestingX(false);
    }
  };

  const handleClearJobs = async () => {
    if (confirmText !== "delete posted jobs") return;
    try {
      await clearPostedJobsAction();
      notifications.show({
        title: "Success",
        message: "Posted jobs cleared",
        color: "green",
      });
      closeClearJobs();
      setConfirmText("");
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to clear jobs",
        color: "red",
      });
    }
  };

  const handleResetSettings = async () => {
    if (confirmText !== "reset all settings") return;
    try {
      await resetAllSettingsAction();
      notifications.show({
        title: "Success",
        message: "Settings reset",
        color: "green",
      });
      closeResetSettings();
      setConfirmText("");
      router.refresh();
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to reset settings",
        color: "red",
      });
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <Stack gap="xl">
      <Tabs defaultValue="ai" variant="default" radius={0}>
        <Tabs.List>
          <Tabs.Tab value="ai" leftSection={<Bot size={16} />}>
            AI Settings
          </Tabs.Tab>
          <Tabs.Tab value="x-api" leftSection={<Twitter size={16} />}>
            X API
          </Tabs.Tab>
          <Tabs.Tab value="telegram" leftSection={<Send size={16} />}>
            Telegram
          </Tabs.Tab>
          <Tabs.Tab value="fetching" leftSection={<Search size={16} />}>
            Job Fetching
          </Tabs.Tab>
          <Tabs.Tab value="account" leftSection={<User size={16} />}>
            Account
          </Tabs.Tab>
          <Tabs.Tab value="data" leftSection={<Database size={16} />}>
            Data Management
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ai" pt="md">
          <Paper>
            <Stack gap="md">
              <Title
                order={4}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                AI Configuration
              </Title>
              <Select
                label="Default AI Model"
                data={[
                  { value: "gpt-4o", label: "GPT-4o (OpenAI)" },
                  {
                    value: "claude-3-5-sonnet-20240620",
                    label: "Claude 3.5 Sonnet",
                  },
                  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
                ]}
                value={aiModel}
                onChange={setAiModel}
              />

              <Stack gap={0}>
                <Text
                  size="sm"
                  fw={700}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  Temperature ({aiTemp})
                </Text>
                <Text size="xs" c="dimmed">
                  Controls randomness (0 = deterministic, 1 = creative)
                </Text>
                <Slider
                  value={aiTemp}
                  onChange={setAiTemp}
                  min={0}
                  max={1}
                  step={0.1}
                  size="lg"
                  thumbSize={20}
                  styles={{
                    thumb: {
                      borderWidth: 2,
                      borderColor: "var(--mantine-color-default-border)",
                      borderRadius: 0,
                    },
                    track: { borderRadius: 0 },
                    bar: { borderRadius: 0 },
                  }}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 0.5, label: "0.5" },
                    { value: 1, label: "1" },
                  ]}
                  mb="lg"
                />
              </Stack>

              <NumberInput
                label="Max Tokens"
                description="Maximum length of generated content"
                value={aiMaxTokens}
                onChange={setAiMaxTokens}
                min={100}
                max={10000}
              />

              <Group justify="flex-end">
                <Button
                  onClick={handleSaveAISettings}
                  loading={saving}
                  radius={0}
                >
                  Save AI Settings
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="x-api" pt="md">
          <Paper>
            <Stack gap="md">
              <Group justify="space-between">
                <Title
                  order={4}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  X (Twitter) API Connection
                </Title>
                {xStatus === "connected" && (
                  <Badge
                    color="green"
                    leftSection={<CheckCircle2 size={12} />}
                    radius={0}
                  >
                    Connected
                  </Badge>
                )}
                {xStatus === "error" && (
                  <Badge
                    color="red"
                    leftSection={<XCircle size={12} />}
                    radius={0}
                  >
                    Error
                  </Badge>
                )}
              </Group>

              <Text size="sm" c="dimmed">
                Manage your connection to the X API for posting job threads.
              </Text>

              <Group>
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<RefreshCw size={16} />}
                  onClick={testXConnection}
                  loading={testingX}
                  radius={0}
                  style={{ border: "1px solid" }}
                >
                  Test X API Connection
                </Button>
              </Group>

              <Divider />

              <RateLimitTracker />
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="telegram" pt="md">
          <Paper>
            <Stack gap="md">
              <Group>
                <Send size={24} color="#229ED9" />
                <Title
                  order={4}
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  Telegram Notifications
                </Title>
              </Group>

              <Alert title="Setup" color="blue" variant="light" radius={0}>
                Add <code>TELEGRAM_BOT_TOKEN</code> and{" "}
                <code>TELEGRAM_CHAT_ID</code> to .env.local
              </Alert>

              <Switch
                label="Enable Notifications"
                description="Receive alerts for new jobs"
                defaultChecked
                size="md"
                thumbIcon={
                  <CheckCircle2 color="var(--mantine-color-blue-6)" size={12} />
                }
                styles={{
                  thumb: { borderRadius: 0 },
                  track: { borderRadius: 0 },
                }}
              />

              <Group>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setTestingTelegram(true);
                    try {
                      await fetch("/api/notifications/test", {
                        method: "POST",
                      });
                      notifications.show({
                        title: "Sent",
                        message: "Check your Telegram app",
                        color: "green",
                      });
                    } catch (e) {
                      notifications.show({
                        title: "Error",
                        message: "Failed to send",
                        color: "red",
                      });
                    } finally {
                      setTestingTelegram(false);
                    }
                  }}
                  loading={testingTelegram}
                  radius={0}
                  style={{ borderWidth: "2px" }}
                >
                  Send Test Notification
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="fetching" pt="md">
          <Paper>
            <Stack gap="md">
              <Title
                order={4}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                Job Fetch Configuration
              </Title>
              <TextInput
                label="Default Search Query"
                placeholder="e.g. software engineer, react"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <Group grow>
                <TextInput
                  label="Default Location"
                  placeholder="e.g. Remote, San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                />
                <NumberInput
                  label="Min Salary (Annual)"
                  prefix="$"
                  value={salaryMin}
                  onChange={setSalaryMin}
                />
              </Group>
              <Switch
                label="Remote Only"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.currentTarget.checked)}
                size="md"
                styles={{
                  thumb: { borderRadius: 0 },
                  track: { borderRadius: 0 },
                }}
              />
              <Group justify="flex-end">
                <Button
                  onClick={handleSaveFetchSettings}
                  loading={saving}
                  radius={0}
                >
                  Save Fetch Config
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="account" pt="md">
          <Paper>
            <Group justify="space-between">
              <Group>
                <Avatar
                  color="blue"
                  radius={0}
                  size="lg"
                  style={{ border: "2px solid" }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
                <div>
                  <Text
                    fw={700}
                    size="lg"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {user.username}
                  </Text>
                  <Text
                    c="dimmed"
                    size="sm"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    User ID: {user.id}
                  </Text>
                </div>
              </Group>
              <Button
                color="red"
                variant="subtle"
                leftSection={<LogOut size={16} />}
                onClick={handleLogout}
                radius={0}
              >
                Logout
              </Button>
            </Group>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="data" pt="md">
          <Stack gap="md">
            <Paper
              style={{
                border: `2px solid var(--mantine-color-red-5)`,
              }}
            >
              <Group justify="space-between">
                <div>
                  <Text
                    fw={700}
                    c="red"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    Clear Posted Jobs
                  </Text>
                  <Text size="sm" c="dimmed">
                    Permanently delete all jobs that have been posted to X.
                  </Text>
                </div>
                <Button
                  color="red"
                  variant="light"
                  onClick={openClearJobs}
                  radius={0}
                >
                  Clear Jobs
                </Button>
              </Group>
            </Paper>

            <Paper
              style={{
                border: `2px solid var(--mantine-color-red-5)`,
              }}
            >
              <Group justify="space-between">
                <div>
                  <Text
                    fw={700}
                    c="red"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    Reset All Settings
                  </Text>
                  <Text size="sm" c="dimmed">
                    Reset all preferences to default. This cannot be undone.
                  </Text>
                </div>
                <Button
                  color="red"
                  variant="outline"
                  onClick={openResetSettings}
                  style={{ borderWidth: "2px" }}
                  radius={0}
                >
                  Reset Settings
                </Button>
              </Group>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Confirmation Modals */}
      <Modal
        opened={clearJobsOpened}
        onClose={closeClearJobs}
        title="Confirm Deletion"
        centered
      >
        <Stack>
          <Text size="sm">
            This action will permanently delete all jobs marked as "Posted".
            This action cannot be undone.
          </Text>
          <Text size="sm">
            Type <strong>delete posted jobs</strong> to confirm.
          </Text>
          <TextInput
            placeholder="delete posted jobs"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <Button
            color="red"
            disabled={confirmText !== "delete posted jobs"}
            onClick={handleClearJobs}
          >
            Confirm Delete
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={resetSettingsOpened}
        onClose={closeResetSettings}
        title="Reset Settings"
        centered
      >
        <Stack>
          <Text size="sm">
            This action will reset your AI, Notification, and Fetch settings to
            defaults.
          </Text>
          <Text size="sm">
            Type <strong>reset all settings</strong> to confirm.
          </Text>
          <TextInput
            placeholder="reset all settings"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <Button
            color="red"
            fullWidth
            disabled={confirmText !== "reset all settings"}
            onClick={handleResetSettings}
          >
            Confirm Reset
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
