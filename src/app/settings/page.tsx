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
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            Settings
          </Title>
          <Badge variant="light" color="gray" size="sm">
            Configuration
          </Badge>
        </Group>
        <Text c="dimmed" size="sm">
          Manage scraping keywords, API keys, and notification preferences.
        </Text>
      </div>

      <Paper p="xl" radius="md" withBorder ta="center">
        <Stack align="center" gap="md">
          <ThemeIcon variant="light" color="violet" size={60} radius="xl">
            <Settings style={{ width: rem(28), height: rem(28) }} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">
              Settings coming in Phase 2
            </Text>
            <Text c="dimmed" size="sm" maw={400} mx="auto" mt={4}>
              Configure scraping keywords, frequency, API integrations, and
              Telegram notifications here.
            </Text>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
