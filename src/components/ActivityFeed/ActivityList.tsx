"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Stack,
  Loader,
  Button,
  useMantineTheme,
  Box,
  SimpleGrid,
  Text,
  Group,
  Badge,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { useActivities } from "@/hooks/use-activities";
import { RefreshCwIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ActivityMobileCard } from "./ActivityMobileCard";
import { ActivityDetailModal } from "./ActivityDetailModal";
import type { ActivityLog, ActivityType } from "@/types/activity";

interface ActivityListProps {
  filter?: string | null;
}

export function ActivityList({ filter }: ActivityListProps) {
  const theme = useMantineTheme();
  const { resolvedTheme } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);

  // Fetch ALL activities (userId = undefined)
  const { activities, loading, error, refetch } = useActivities(
    undefined,
    filter,
  );

  if (loading) {
    return (
      <Card padding="md">
        <Stack align="center" justify="center" h={200}>
          <Loader size="sm" color={theme.other.text.primary} />
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <Stack align="center" justify="center" h={200}>
          <Text c="red" fw={700}>
            Failed to load activities
          </Text>
          <Button size="xs" onClick={() => refetch()} variant="default">
            Retry
          </Button>
        </Stack>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card padding="md">
        <Stack align="center" justify="center" h={200}>
          <Text c="dimmed">No activities found.</Text>
        </Stack>
      </Card>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type as ActivityType) {
      case "login":
        return "blue";
      case "job_fetch":
        return "cyan";
      case "job_approved":
        return "green";
      case "job_rejected":
        return "red";
      case "job_posted":
        return "indigo";
      case "content_generated":
        return "violet";
      case "settings_updated":
        return "gray";
      case "api_error":
        return "red";
      default:
        return "gray";
    }
  };

  const rows = activities.map((activity) => (
    <Table.Tr
      key={activity.id}
      onClick={() => {
        setSelectedActivity(activity);
        setModalOpened(true);
      }}
      style={{ cursor: "pointer" }}
    >
      <Table.Td>
        <Group gap="sm">
          <Text size="sm" fw={700}>
            {/* Ideally we fetch user details, but we only have ID */}
            {activity.user_id ? "Admin" : "System"}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge
          size="sm"
          variant="light"
          color={getTypeColor(activity.activity_type)}
        >
          {activity.activity_type.replace("_", " ")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>
          {activity.description}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {activity.created_at
            ? formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })
            : "Unknown"}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Group justify="flex-end" mb="xs">
        <Button
          c="dimmed"
          variant="subtle"
          size="compact-xs"
          onClick={() => refetch()}
          leftSection={<RefreshCwIcon size={12} />}
        >
          REFRESH
        </Button>
      </Group>

      <Box visibleFrom="sm">
        <Card
          padding={0}
          style={{
            border: "none",
          }}
        >
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Card>
      </Box>

      <Box hiddenFrom="sm">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
          {activities.map((activity) => (
            <ActivityMobileCard
              key={activity.id}
              activity={activity}
              onViewDetails={(act) => {
                setSelectedActivity(act);
                setModalOpened(true);
              }}
            />
          ))}
        </SimpleGrid>
      </Box>

      <ActivityDetailModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        activity={selectedActivity}
      />
    </Box>
  );
}
