import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  ActionIcon,
  Collapse,
  Box,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  Edit,
} from "lucide-react";
import { Job } from "@/types/database";

interface JobCardProps {
  job: Job;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit?: (job: Job) => void;
}

export function JobCard({ job, onApprove, onReject, onEdit }: JobCardProps) {
  const [opened, { toggle }] = useDisclosure(false);

  const isDraft = job.status === "draft";
  const isPending = job.status === "pending";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Text fw={600} size="lg">
            {job.title}
          </Text>
          <Badge color={isDraft ? "teal" : "gray"} variant="light">
            {job.status}
          </Badge>
        </Group>
        <Group gap={8}>
          <ActionIcon
            variant="subtle"
            color="gray"
            component="a"
            href={job.url}
            target="_blank"
          >
            <ExternalLink size={16} />
          </ActionIcon>
          <Button
            variant="subtle"
            size="xs"
            onClick={toggle}
            rightSection={
              opened ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            }
          >
            {opened ? "Less" : "Details"}
          </Button>
        </Group>
      </Group>

      <Text size="sm" c="dimmed" mb="md">
        {job.company} • {job.location || "Remote"} • {job.salary || "No Salary"}
      </Text>

      {/* AI Content Preview (Draft Only) */}
      {isDraft && (
        <Card.Section inheritPadding py="xs" bg="var(--mantine-color-dark-6)">
          <Group gap="xs" mb={8}>
            <Sparkles size={16} color="var(--mantine-color-yellow-4)" />
            <Text size="xs" fw={700} c="yellow.4">
              AI GENERATED CONTENT
            </Text>
          </Group>
          <Text size="sm" fs="italic" mb="xs">
            &quot;{job.ai_hook}&quot;
          </Text>

          <Collapse in={opened}>
            <Stack gap="xs" mt="sm">
              <Text size="xs" fw={700} c="dimmed">
                THREAD:
              </Text>
              <Box
                pl="md"
                style={{ borderLeft: "2px solid var(--mantine-color-dark-4)" }}
              >
                {(Array.isArray(job.ai_thread) ? job.ai_thread : []).map(
                  (tweet, i) => (
                    <Text key={i} size="sm" mb={8}>
                      {tweet}
                    </Text>
                  ),
                )}
              </Box>
              <Text size="xs" fw={700} c="dimmed">
                REPLY:
              </Text>
              <Text size="sm" c="blue.4">
                {job.ai_reply}
              </Text>

              {job.ai_analysis && (
                <>
                  <Divider my="xs" />
                  <Text size="xs" fw={700} c="dimmed">
                    ANALYSIS:
                  </Text>
                  <Text size="xs">{job.ai_analysis}</Text>
                </>
              )}
            </Stack>
          </Collapse>
        </Card.Section>
      )}

      {/* Actions */}
      <Group mt="md" justify="flex-end">
        {onEdit && (
          <Button
            variant="default"
            size="xs"
            leftSection={<Edit size={14} />}
            onClick={() => onEdit(job)}
          >
            Edit
          </Button>
        )}
        <Button
          variant="light"
          color="red"
          size="xs"
          leftSection={<X size={14} />}
          onClick={() => onReject(job.id)}
        >
          Reject
        </Button>
        {isDraft && (
          <Button
            color="teal"
            size="xs"
            leftSection={<Check size={14} />}
            onClick={() => onApprove(job.id)}
          >
            Approve & Queue
          </Button>
        )}
      </Group>
    </Card>
  );
}
