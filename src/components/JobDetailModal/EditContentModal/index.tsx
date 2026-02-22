import { useEffect } from "react";
import {
  Modal,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { AlertCircle as IconAlertCircle } from "lucide-react";
import type { Job } from "@/types/job";

interface EditContentModalProps {
  opened: boolean;
  onClose: () => void;
  job: Job;
  onSave: (primary: string, reply: string) => void;
}

export function EditContentModal({
  opened,
  onClose,
  job,
  onSave,
}: EditContentModalProps) {
  const form = useForm({
    initialValues: {
      primary: job.ai_thread_primary || "",
      reply: job.ai_thread_reply || "",
    },
    validate: {
      primary: (value) =>
        value.length > 280 ? "Tweet must be under 280 characters" : null,
      reply: (value) =>
        value.length > 280 ? "Tweet must be under 280 characters" : null,
    },
  });

  // Reset form when job changes
  useEffect(() => {
    if (opened) {
      form.setValues({
        primary: job.ai_thread_primary || "",
        reply: job.ai_thread_reply || "",
      });
    }
  }, [opened, job]);

  const handleSave = () => {
    if (form.validate().hasErrors) return;
    onSave(form.values.primary, form.values.reply);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Tweet Content"
      centered
      size="lg"
    >
      <Stack gap="md">
        <Textarea
          label="Primary Tweet (Hook)"
          description="Should be engaging and NOT contain the link"
          placeholder="Draft your hook..."
          minRows={4}
          autosize
          {...form.getInputProps("primary")}
        />
        <Group justify="flex-end">
          <Text
            size="xs"
            c={(form.values.primary?.length || 0) > 280 ? "red" : "dimmed"}
          >
            {form.values.primary?.length || 0}/280
          </Text>
        </Group>

        <Textarea
          label="Reply Tweet"
          description="Must contain the application link"
          placeholder="Add link and call to action..."
          minRows={4}
          autosize
          {...form.getInputProps("reply")}
        />
        <Group justify="flex-end">
          <Text
            size="xs"
            c={(form.values.reply?.length || 0) > 280 ? "red" : "dimmed"}
          >
            {form.values.reply?.length || 0}/280
          </Text>
        </Group>

        {(form.values.primary.length > 280 ||
          form.values.reply.length > 280) && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            One or more tweets exceed the 280 character limit.
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="indigo">
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
