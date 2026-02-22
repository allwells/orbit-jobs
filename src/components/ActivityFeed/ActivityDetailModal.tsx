import { Modal, JsonInput, Text, Group, Badge, Stack } from "@mantine/core";
import type { Database } from "@/types/database";
import { format } from "date-fns";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

interface ActivityDetailModalProps {
  opened: boolean;
  onClose: () => void;
  activity: Activity | null;
}

export function ActivityDetailModal({
  opened,
  onClose,
  activity,
}: ActivityDetailModalProps) {
  if (!activity) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Activity Details</Text>}
      centered
      size="lg"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Type
          </Text>
          <Badge color="blue" variant="light">
            {activity.activity_type}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            Timestamp
          </Text>
          <Text size="sm">
            {activity.created_at
              ? format(new Date(activity.created_at), "PPpp")
              : "N/A"}
          </Text>
        </Group>

        <div>
          <Text fw={500} mb={4}>
            {activity.title}
          </Text>
          <Text size="sm" c="dimmed">
            {activity.description}
          </Text>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Metadata Payload
          </Text>
          <JsonInput
            value={JSON.stringify(activity.metadata, null, 2)}
            formatOnBlur
            autosize
            minRows={4}
            maxRows={15}
            readOnly
          />
        </div>
      </Stack>
    </Modal>
  );
}
