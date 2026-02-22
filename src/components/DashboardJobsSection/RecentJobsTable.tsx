import { Table, Badge, Text, Group, ActionIcon, Menu } from "@mantine/core";
import { MoreHorizontal as IconDots, Eye as IconEye } from "lucide-react";
import type { Job } from "@/types/job";
import { useRouter } from "next/navigation";

interface RecentJobsTableProps {
  jobs: Job[];
}

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  const router = useRouter();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "green"; // Themes usually map this to success
      case "rejected":
        return "red"; // Themes usually map this to error
      case "posted":
        return "indigo"; // Brand color for posted
      default:
        return "yellow"; // Warning color for pending
    }
  };

  const rows = jobs.map((job) => (
    <Table.Tr key={job.id}>
      <Table.Td>
        <Group gap="xs">
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600} lineClamp={1} c="text.primary">
              {job.title}
            </Text>
            <Text size="xs" c="text.secondary" lineClamp={1}>
              {job.company}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td width={100}>
        <Badge
          color={getStatusColor(job.status)}
          variant="light"
          size="sm"
          style={{ textTransform: "capitalize" }}
        >
          {job.status}
        </Badge>
      </Table.Td>
      <Table.Td width={50}>
        <Menu shadow="md" width={150} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={14} />}
              onClick={() => router.push("/jobs")}
            >
              View Details
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table verticalSpacing="xs" highlightOnHover>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
