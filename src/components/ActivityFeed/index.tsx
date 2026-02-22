"use client";

import {
  Card,
  Text,
  Timeline,
  Group,
  Button,
  ActionIcon,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { useActivities } from "@/hooks/use-activities";
import { useState } from "react";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { ActivityItem } from "./ActivityItem";
import { ActivityItemSkeleton } from "./ActivityItemSkeleton";
import type { Database } from "@/types/database";
import { ActivityIcon, RefreshCwIcon } from "lucide-react";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

export function ActivityFeed({
  filter,
  initialData,
}: {
  filter?: string | null;
  initialData?: Activity[];
}) {
  // We want to show ALL activities in the feed, not just the user's
  const { activities, loading, error, refetch } = useActivities(
    undefined, // Fetch all activities
    filter,
    initialData,
  );
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const renderContent = () => {
    // Loading state (initial load)
    if (loading && activities.length === 0) {
      return (
        <Stack gap="md" mt="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </Stack>
      );
    }

    // Error state
    if (error) {
      return (
        <Text c="red" size="sm" ta="center" py="xl">
          Failed to load activities.
          <Button
            variant="subtle"
            size="compact-xs"
            onClick={() => refetch()}
            ml="xs"
          >
            Retry
          </Button>
        </Text>
      );
    }

    // Empty state
    if (activities.length === 0) {
      return (
        <Stack align="center" justify="center" py={50} h="100%">
          <Text c="dimmed" size="sm" ta="center">
            No recent activity found.
          </Text>
        </Stack>
      );
    }

    // Data state
    return (
      <ScrollArea h={400} offsetScrollbars>
        <Timeline active={-1} bulletSize={24} lineWidth={2} p="xs">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onViewDetails={setSelectedActivity}
            />
          ))}
        </Timeline>
      </ScrollArea>
    );
  };

  return (
    <>
      <Card
        withBorder
        padding="md"
        radius={0}
        shadow="sm"
        bg="background.secondary"
        style={{ borderColor: "var(--mantine-color-border-default)" }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <ActivityIcon size={16} />
            <Text fw={600} c="text.primary">
              Recent Activity
            </Text>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCwIcon size={14} />
          </ActionIcon>
        </Group>

        {renderContent()}
      </Card>

      <ActivityDetailModal
        opened={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </>
  );
}
