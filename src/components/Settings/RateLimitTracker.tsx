"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Group,
  Stack,
  RingProgress,
  Center,
  Loader,
  Button,
} from "@mantine/core";
import { RefreshCw } from "lucide-react";

interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
}

export function RateLimitTracker() {
  const [data, setData] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);
    setNotConfigured(false);
    try {
      const res = await fetch("/api/settings/rate-limits");

      if (res.status === 503) {
        setNotConfigured(true);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch limits");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Failed to load rate limits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  if (notConfigured) {
    return (
      <Paper
        withBorder
        p="md"
        radius={0}
        style={{
          borderWidth: "2px",
          borderColor: "var(--mantine-color-default-border)",
        }}
      >
        <Group justify="space-between" mb="xs">
          <Text fw={600}>X API Status</Text>
          <Button
            variant="subtle"
            size="xs"
            onClick={fetchLimits}
            loading={loading}
          >
            Retry
          </Button>
        </Group>
        <Text c="dimmed" size="sm">
          Not Connected. Please configure your API keys in .env.local.
        </Text>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        withBorder
        p="md"
        radius={0}
        style={{
          borderWidth: "2px",
          borderColor: "var(--mantine-color-default-border)",
        }}
      >
        <Text c="red" size="sm">
          {error}
        </Text>
        <Button variant="subtle" size="xs" onClick={fetchLimits} mt="xs">
          Retry
        </Button>
      </Paper>
    );
  }

  if (!data && loading) {
    return (
      <Paper
        withBorder
        p="md"
        radius={0}
        style={{
          borderWidth: "2px",
          borderColor: "var(--mantine-color-default-border)",
        }}
      >
        <Center>
          <Loader size="sm" />
        </Center>
      </Paper>
    );
  }

  if (!data) return null;

  const used = data.limit - data.remaining;
  const percentage = Math.round((used / data.limit) * 100);
  const resetTime = new Date(data.reset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Paper
      withBorder
      p="md"
      radius={0}
      style={{
        borderWidth: "2px",
        borderColor: "var(--mantine-color-default-border)",
      }}
    >
      <Group justify="space-between" mb="md">
        <Text fw={600}>X API Rate Limits</Text>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<RefreshCw size={14} />}
          onClick={fetchLimits}
          loading={loading}
        >
          Refresh
        </Button>
      </Group>

      <Group align="flex-start">
        <RingProgress
          size={80}
          thickness={8}
          roundCaps
          sections={[
            { value: percentage, color: percentage > 90 ? "red" : "blue" },
          ]}
          label={
            <Center>
              <Text c="dimmed" fw={700} size="xs">
                {percentage}%
              </Text>
            </Center>
          }
        />

        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Daily Posts Limit
          </Text>
          <Text size="xs" c="dimmed">
            {used} / {data.limit} requests used
          </Text>
          <Text size="xs" c="dimmed">
            Resets at {resetTime}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
