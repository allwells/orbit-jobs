"use client";

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  useMantineTheme,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  LogIn as LogInIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Send as SendIcon,
  Sparkles as SparklesIcon,
  Settings as SettingsIcon,
  AlertTriangle as AlertTriangleIcon,
  Activity as ActivityIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog, ActivityType } from "@/types/activity";

interface ActivityMobileCardProps {
  activity: ActivityLog;
  onViewDetails?: (activity: ActivityLog) => void;
}

const getActivityConfig = (type: string) => {
  switch (type as ActivityType) {
    case "login":
      return { icon: LogInIcon, color: "blue", label: "Login" };
    case "job_fetch":
      return { icon: SearchIcon, color: "cyan", label: "Fetch" };
    case "job_approved":
      return { icon: CheckCircleIcon, color: "green", label: "Approved" };
    case "job_rejected":
      return { icon: XCircleIcon, color: "red", label: "Rejected" };
    case "job_posted":
      return { icon: SendIcon, color: "indigo", label: "Posted" };
    case "content_generated":
      return { icon: SparklesIcon, color: "violet", label: "AI Gen" };
    case "settings_updated":
      return { icon: SettingsIcon, color: "gray", label: "Settings" };
    case "api_error":
      return { icon: AlertTriangleIcon, color: "red", label: "Error" };
    default:
      return { icon: ActivityIcon, color: "gray", label: "Activity" };
  }
};

export function ActivityMobileCard({
  activity,
  onViewDetails,
}: ActivityMobileCardProps) {
  const theme = useMantineTheme();
  const {
    icon: Icon,
    color,
    label,
  } = getActivityConfig(activity.activity_type);

  return (
    <Card
      withBorder
      p="md"
      radius={0}
      onClick={() => onViewDetails?.(activity)}
      styles={{
        root: {
          cursor: onViewDetails ? "pointer" : "default",
          transition: "all 0.1s ease",
          borderWidth: "2px",
          "&:hover": onViewDetails
            ? {
                backgroundColor: "var(--mantine-color-default-hover)",
                borderColor: "var(--mantine-color-blue-filled)",
              }
            : {},
        },
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={32} radius={0} color={color} variant="light">
              <Icon size={18} />
            </ThemeIcon>
            <Box>
              <Text size="sm" fw={700} lineClamp={1}>
                {activity.title || label}
              </Text>
              <Text size="xs" c="dimmed">
                {activity.user_id ? "Admin" : "System"}
              </Text>
            </Box>
          </Group>
          <Badge size="xs" variant="outline" color={color}>
            {label}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {activity.description}
        </Text>

        <Group justify="flex-end">
          <Text size="xs" c="dimmed">
            {activity.created_at
              ? formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })
              : "Unknown"}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
