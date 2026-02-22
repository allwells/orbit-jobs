import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Checkbox,
  Menu,
  ActionIcon,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import {
  MoreHorizontal as IconDots,
  Eye as IconEye,
  Check as IconCheck,
  X as IconX,
  Trash as IconTrash,
  Sparkles as IconSparkles,
} from "lucide-react";
import type { Job } from "@/types/job";

interface JobMobileCardProps {
  job: Job;
  isSelected: boolean;
  onToggleSelection: () => void;
  onViewDetails: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (job: Job, status: "approved" | "rejected") => void;
  isProcessing?: boolean;
}

export function JobMobileCard({
  job,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onDelete,
  onStatusChange,
  isProcessing,
}: JobMobileCardProps) {
  const theme = useMantineTheme();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "posted":
        return "blue";
      default:
        return "yellow";
    }
  };

  return (
    <Card
      withBorder
      p="sm"
      radius={0}
      onClick={() => onViewDetails(job)}
      bg={isSelected ? theme.other.background.active : undefined}
      styles={(theme) => ({
        root: {
          cursor: "pointer",
          transition: "background-color 0.1s ease",
          borderWidth: "2px",
          borderColor: isSelected
            ? theme.colors.indigo[6]
            : "var(--mantine-color-default-border)",
          "&:hover": {
            backgroundColor: `${theme.other.background.secondary} !important`,
          },
        },
      })}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={600} size="sm" lineClamp={3}>
              {job.title}
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            {job.company}
          </Text>
          <Group gap="xs" mt={4}>
            {job.remote_allowed && (
              <Badge variant="outline" color="cyan" size="xs">
                Remote
              </Badge>
            )}
            <Badge color={getStatusColor(job.status)} variant="light" size="xs">
              {job.status}
            </Badge>
            <Text size="xs" fw={500}>
              {job.salary_min
                ? `$${(job.salary_min / 1000).toFixed(0)}k` +
                  (job.salary_max
                    ? ` - $${(job.salary_max / 1000).toFixed(0)}k`
                    : "+")
                : "Salary not specified"}
            </Text>
          </Group>
        </Stack>

        <Stack gap="xs" align="flex-end" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onChange={onToggleSelection}
            radius={0}
          />

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                loading={isProcessing}
                disabled={isProcessing}
                size="sm"
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item
                leftSection={<IconEye size={14} />}
                onClick={() => onViewDetails(job)}
              >
                View Details
              </Menu.Item>

              {job.status === "pending" && job.ai_content_generated && (
                <>
                  <Menu.Item
                    leftSection={<IconCheck size={14} />}
                    color="green"
                    onClick={() => onStatusChange(job, "approved")}
                  >
                    Approve
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconX size={14} />}
                    color="red"
                    onClick={() => onStatusChange(job, "rejected")}
                  >
                    Reject
                  </Menu.Item>
                </>
              )}

              {job.status === "approved" && !job.ai_content_generated && (
                <Menu.Item
                  leftSection={<IconSparkles size={14} />}
                  color="violet"
                >
                  Generate Content
                </Menu.Item>
              )}

              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(job)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Stack>
      </Group>
    </Card>
  );
}
