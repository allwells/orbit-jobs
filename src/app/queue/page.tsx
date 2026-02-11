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
import { ListTodo } from "lucide-react";

export default function QueuePage() {
  return (
    <Stack gap="lg">
      <div>
        <Group gap="sm" align="center" mb={4}>
          <Title order={2} fw={700}>
            Job Queue
          </Title>
          <Badge variant="light" color="gray" size="sm">
            0 pending
          </Badge>
        </Group>
        <Text c="dimmed" size="sm">
          Review, approve, and publish AI-polished job threads.
        </Text>
      </div>

      <Paper p="xl" radius="md" withBorder ta="center">
        <Stack align="center" gap="md">
          <ThemeIcon variant="light" color="indigo" size={60} radius="xl">
            <ListTodo style={{ width: rem(28), height: rem(28) }} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="lg">
              No jobs in queue
            </Text>
            <Text c="dimmed" size="sm" maw={400} mx="auto" mt={4}>
              Once The Seeker starts scraping and The Brain generates drafts,
              they&apos;ll appear here for review.
            </Text>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
