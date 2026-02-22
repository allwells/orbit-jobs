import {
  Stack,
  Button,
  Text,
  Group,
  Card,
  Divider,
  CopyButton,
  Tooltip,
  ActionIcon,
  Badge,
} from "@mantine/core";
import {
  Twitter,
  Copy as IconCopy,
  Check as IconCheck,
  ExternalLink as IconExternalLink,
} from "lucide-react";
import type { Job } from "@/types/job";
import { useXPosting } from "./use-post-to-x";

interface PostingControlsProps {
  job: Job;
  onPostSuccess: (tweetUrl: string) => void;
}

export function PostingControls({ job, onPostSuccess }: PostingControlsProps) {
  const { posting, postToX } = useXPosting();

  const handlePost = () => {
    postToX(job.id, onPostSuccess);
  };

  if (job.status === "posted") {
    return (
      <Card
        withBorder
        padding="md"
        radius={0}
        bg="blue.9"
        style={
          {
            opacity: 0.9,
            padding: "var(--mantine-spacing-md)",
            "@media (min-width: 48em)": {
              padding: "var(--mantine-spacing-lg)",
            },
          } as any
        }
      >
        <Stack align="center" gap="xs">
          <Badge size="lg" color="blue" leftSection={<Twitter size={16} />}>
            Posted to X
          </Badge>
          <Text size="sm">
            Posted on {new Date(job.posted_at || "").toLocaleDateString()}
          </Text>
          {job.x_tweet_id && (
            <Button
              component="a"
              href={`https://twitter.com/TheOrbitJobs/status/${job.x_tweet_id}`}
              target="_blank"
              variant="light"
              color="blue"
              size="xs"
              rightSection={<IconExternalLink size={14} />}
            >
              View Tweet
            </Button>
          )}
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      withBorder
      padding="md"
      radius={0}
      style={
        {
          borderWidth: "2px",
          borderColor: "var(--mantine-color-default-border)",
          padding: "var(--mantine-spacing-md)",
          "@media (min-width: 48em)": {
            padding: "var(--mantine-spacing-lg)",
          },
        } as any
      }
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <Twitter size={20} color="#1DA1F2" />
            <Text fw={600}>X (Twitter) Posting</Text>
          </Group>
          {/* Rate limit badge could go here */}
        </Group>

        <Text size="sm" c="dimmed">
          Post this job thread to the @TheOrbitJobs account.
        </Text>

        <Group gap="sm" wrap="wrap">
          <CopyButton
            value={`${job.ai_thread_primary}\n\n${job.ai_thread_reply}`}
            timeout={2000}
          >
            {({ copied, copy }) => (
              <Button
                color={copied ? "teal" : "gray"}
                variant="light"
                onClick={copy}
                style={{ flex: 1, minWidth: "200px" }}
                leftSection={
                  copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                }
              >
                {copied ? "Copied" : "Copy Thread"}
              </Button>
            )}
          </CopyButton>

          <Button
            color="black"
            loading={posting}
            onClick={handlePost}
            style={{ flex: 1, minWidth: "200px" }}
            leftSection={<Twitter size={16} />}
          >
            Post to X
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
