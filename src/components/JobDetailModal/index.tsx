import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Button,
  Divider,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Building as IconBuilding,
  MapPin as IconMapPin,
  DollarSign as IconCurrencyDollar,
  Clock as IconClock,
  ExternalLink as IconExternalLink,
  Check as IconCheck,
  X as IconX,
  Trash as IconTrash,
} from "lucide-react";
import { ContentSection } from "./ContentSection";
import { EditContentModal } from "./EditContentModal";
import { PostingControls } from "../PostingControls";
import type { JobDetailModalProps } from "./types";
import { supabase } from "@/lib/supabase";
import { notifications } from "@mantine/notifications";
import type { Job } from "@/types/job";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function JobDetailModal({
  job,
  opened,
  onClose,
  onUpdate,
  onDelete,
}: JobDetailModalProps) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const { user } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!job) return null;

  const handleUpdate = async (updatedJob: typeof job) => {
    // Optimistic update
    if (onUpdate) onUpdate(updatedJob);

    try {
      // If manually editing, update DB directly
      // (ContentSection handles its own DB updates via API for generation)
      if (editOpened) {
        const { error } = await supabase
          .from("jobs")
          .update({
            ai_thread_primary: updatedJob.ai_thread_primary,
            ai_thread_reply: updatedJob.ai_thread_reply,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedJob.id);

        if (error) throw error;

        notifications.show({
          title: "Success",
          message: "Content updated successfully",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Failed to update job:", error);
      notifications.show({
        title: "Error",
        message: "Failed to save changes",
        color: "red",
      });
      // Revert functionality would be ideal here in a real app
    }
  };

  const handleManualSave = (primary: string, reply: string) => {
    handleUpdate({
      ...job,
      ai_thread_primary: primary,
      ai_thread_reply: reply,
    });
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    if (!user) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, userId: user.id }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      notifications.show({
        title: "Success",
        message: `Job ${newStatus} successfully`,
        color: newStatus === "approved" ? "green" : "red",
      });

      if (onUpdate) {
        onUpdate({ ...job, status: newStatus });
      }
    } catch (error) {
      console.error("Status update error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update status",
        color: "red",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePostSuccess = (tweetUrl: string) => {
    if (onUpdate) {
      onUpdate({
        ...job,
        status: "posted",
        posted_to_x: true,
        posted_at: new Date().toISOString(),
        x_tweet_id: tweetUrl.split("/").pop() || null,
      });
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="xl"
        padding={0}
        styles={{
          body: {
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
          content: {
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
          inner: {
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        }}
        title={null}
      >
        <Stack gap="xl">
          <Text fw={700} fz={{ base: "lg", sm: "xl" }} style={{ flex: 1 }}>
            {job.title}
          </Text>
          {/* Job Details Header */}
          <Stack gap="xs">
            <Group justify="space-between" align="start" wrap="wrap" gap="sm">
              <Stack gap={4} style={{ flex: 1, minWidth: "200px" }}>
                <Group gap="xs" align="center" wrap="wrap">
                  <Group gap="xs" c="dimmed">
                    <IconBuilding size={14} />
                    <Text size="xs" fw={500}>
                      {job.company}
                    </Text>
                  </Group>
                  <Group gap={4}>
                    {job.remote_allowed && (
                      <Badge variant="outline" color="cyan" size="xs">
                        Remote
                      </Badge>
                    )}
                    <Badge
                      color={getStatusColor(job.status || "pending")}
                      size="xs"
                    >
                      {job.status}
                    </Badge>
                  </Group>
                </Group>
                <Group gap="md" wrap="wrap">
                  <Group gap={4}>
                    <IconMapPin size={14} className="text-gray-500" />
                    <Text size="xs">{job.location || "Remote"}</Text>
                  </Group>
                  <Group gap={4}>
                    <IconCurrencyDollar size={14} className="text-gray-500" />
                    <Text size="xs">{formatSalary(job)}</Text>
                  </Group>
                  <Group gap={4}>
                    <IconClock size={14} className="text-gray-500" />
                    <Text size="xs">{job.employment_type || "Full-time"}</Text>
                  </Group>
                </Group>
              </Stack>

              {/* Approval Actions */}
              {job.status === "pending" && job.ai_content_generated && (
                <Group gap={6} style={{ flexShrink: 0 }}>
                  <Tooltip label="Approve">
                    <ActionIcon
                      variant="light"
                      color="green"
                      size="lg"
                      loading={updatingStatus}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange("approved")}
                    >
                      <IconCheck size={20} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Reject">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="lg"
                      loading={updatingStatus}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange("rejected")}
                    >
                      <IconX size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </Group>
          </Stack>

          <Divider />

          {/* AI Content Section */}
          <ContentSection
            job={job}
            onUpdate={(updated) => handleUpdate(updated)}
            onEdit={openEdit}
          />

          {/* Posting Controls (Only show if approved or posted, and content exists) */}
          {(job.status === "approved" || job.status === "posted") &&
            job.ai_content_generated && (
              <>
                <Divider />
                <PostingControls job={job} onPostSuccess={handlePostSuccess} />
              </>
            )}

          <Divider label="Job Description" labelPosition="center" />

          {/* Description */}
          <Box
            fz="sm"
            dangerouslySetInnerHTML={{ __html: job.description || "" }}
            style={{ lineHeight: 1.6 }}
          />

          {/* Footer Actions */}
          <Group justify="space-between" mt="md" wrap="nowrap">
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={() => {
                if (job && onDelete) {
                  onDelete(job);
                  onClose();
                }
              }}
            >
              <Box component="span" visibleFrom="xs">
                Delete Job
              </Box>
            </Button>
            <Button
              component="a"
              href={job.apply_url}
              target="_blank"
              variant="outline"
              size="xs"
              rightSection={<IconExternalLink size={16} />}
            >
              View Post
            </Button>
          </Group>
        </Stack>
      </Modal>

      <EditContentModal
        opened={editOpened}
        onClose={closeEdit}
        job={job}
        onSave={handleManualSave}
      />
    </>
  );
}

function getStatusColor(status: string) {
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
}

function formatSalary(job: Job) {
  if (job.salary_min && job.salary_max) {
    return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
  }
  if (job.salary_min) {
    return `$${job.salary_min.toLocaleString()}+`;
  }
  return "Not specified";
}
