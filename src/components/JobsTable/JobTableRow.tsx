import {
  Table,
  Checkbox,
  Badge,
  ActionIcon,
  Menu,
  Group,
  Text,
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
import { useMantineTheme } from "@mantine/core";

interface JobTableRowProps {
  job: Job;
  isSelected: boolean;
  onToggleSelection: () => void;
  onViewDetails: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (job: Job, status: "approved" | "rejected") => void;
  isProcessing?: boolean;
}

export function JobTableRow({
  job,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onDelete,
  onStatusChange,
  isProcessing,
}: JobTableRowProps) {
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
    <Table.Tr
      bg={isSelected ? theme.other.background.active : undefined}
      onClick={() => onViewDetails(job)}
      style={{
        cursor: "pointer",
        transition: "background-color 0.1s ease",
      }}
    >
      <Table.Td onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isSelected} onChange={onToggleSelection} />
      </Table.Td>
      <Table.Td>
        <Text fw={500} lineClamp={1} title={job.title}>
          {job.title}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm">
          {job.salary_min ? (
            `$${(job.salary_min / 1000).toFixed(0)}k` +
            (job.salary_max
              ? ` - $${(job.salary_max / 1000).toFixed(0)}k`
              : "+")
          ) : (
            <Text span c="dimmed" size="xs">
              Not specified
            </Text>
          )}
        </Text>
      </Table.Td>
      <Table.Td>
        {job.remote_allowed ? (
          <Badge variant="outline" color="cyan" size="sm">
            Remote
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(job.status)} variant="light" size="sm">
          {job.status}
        </Badge>
      </Table.Td>
      <Table.Td onClick={(e) => e.stopPropagation()}>
        <Group gap={0} justify="flex-end">
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                loading={isProcessing}
                disabled={isProcessing}
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
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
