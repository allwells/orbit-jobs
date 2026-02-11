"use client";

import {
  Title,
  Text,
  Stack,
  Paper,
  Badge,
  Group,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            Analytics
          </Title>
          <Badge variant="light" color="gray" size="sm">
            X API
          </Badge>
        </Group>
        <Text c="dimmed" size="sm">
          Track post performance and X API rate limits.
        </Text>
      </div>

      <Paper p="xl" radius="md" withBorder ta="center">
        <Stack align="center" gap="md">
          <ThemeIcon variant="light" color="orange" size={60} radius="xl">
            <BarChart3 style={{ width: rem(28), height: rem(28) }} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">
              No analytics yet
            </Text>
            <Text c="dimmed" size="sm" maw={400} mx="auto" mt={4}>
              Analytics will populate once you start posting to X. Rate limit
              tracker: 0 / 500 monthly posts used.
            </Text>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
