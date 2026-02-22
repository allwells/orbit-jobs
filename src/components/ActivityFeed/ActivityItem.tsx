import { Timeline, Group, Text, Badge, Button, ThemeIcon } from "@mantine/core";
import {
  LogInIcon,
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  SendIcon,
  SparklesIcon,
  SettingsIcon,
  AlertTriangleIcon,
  ActivityIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";
import type { ActivityType } from "@/types/activity";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

interface ActivityItemProps {
  activity: Activity;
  onViewDetails: (activity: Activity) => void;
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

export function ActivityItem({ activity, onViewDetails }: ActivityItemProps) {
  const {
    icon: Icon,
    color,
    label,
  } = getActivityConfig(activity.activity_type);

  return (
    <Timeline.Item
      bullet={
        <ThemeIcon
          size={24}
          radius={0}
          color={color}
          variant="light" // Using light variant for better aesthetics in dark mode
        >
          <Icon size={14} />
        </ThemeIcon>
      }
      title={
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={500}>
            {activity.title}
          </Text>
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {activity.created_at &&
              formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
          </Text>
        </Group>
      }
    >
      <Text c="dimmed" size="xs" mt={4}>
        {activity.description}
      </Text>

      <Group mt="xs">
        <Badge size="xs" variant="light" color={color}>
          {label}
        </Badge>
        <Button
          variant="subtle"
          size="compact-xs"
          rightSection={<ExternalLinkIcon size={10} />}
          onClick={() => onViewDetails(activity)}
          color="gray"
        >
          Details
        </Button>
      </Group>
    </Timeline.Item>
  );
}
