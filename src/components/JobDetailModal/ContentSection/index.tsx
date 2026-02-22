import { useState, useEffect } from "react";
import {
  Stack,
  Button,
  Select,
  Card,
  Text,
  Group,
  ActionIcon,
  Badge,
  CopyButton,
  Tooltip,
  Paper,
} from "@mantine/core";
import {
  Sparkles as IconSparkles,
  RefreshCw as IconRefresh,
  Edit as IconEdit,
  Copy as IconCopy,
  Check as IconCheck,
  Bot as IconRobot,
} from "lucide-react";
import type { Job } from "@/types/job";
import { AI_MODELS, type AIProvider, type AIModel } from "@/lib/ai";
import { useContentGeneration } from "../hooks/use-generate-content";

interface ContentSectionProps {
  job: Job;
  onUpdate: (updatedJob: Job) => void;
  onEdit: () => void;
}

export function ContentSection({ job, onUpdate, onEdit }: ContentSectionProps) {
  const [selectedModel, setSelectedModel] = useState<string>(
    `${AI_MODELS[0].provider}/${AI_MODELS[0].model}`,
  );

  const { loading, generateContent } = useContentGeneration();

  // Load default model from settings or localStorage if available
  useEffect(() => {
    const savedModel = localStorage.getItem("orbitjobs-default-model");
    if (savedModel) {
      // Validate that the saved model still exists in configuration
      const exists = AI_MODELS.some(
        (m) => `${m.provider}/${m.model}` === savedModel,
      );
      if (exists) {
        // eslint-disable-next-line
        setSelectedModel(savedModel);
      }
    }
  }, []);

  const handleGenerate = () => {
    const [provider, model] = selectedModel.split("/");
    generateContent(
      job.id,
      provider as AIProvider,
      model as AIModel,
      (content) => {
        onUpdate({
          ...job,
          ai_content_generated: true,
          ai_thread_primary: content.primaryTweet,
          ai_thread_reply: content.replyTweet,
          ai_model_used: selectedModel,
        });
      },
    );
  };

  if (!job.ai_content_generated) {
    return (
      <Card
        withBorder
        padding="md"
        radius={0}
        bg="dark.8"
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
        <Stack align="center" gap="md">
          <IconSparkles size={32} color="var(--mantine-color-indigo-4)" />
          <Text fw={500}>Generate Viral X Thread</Text>
          <Text size="sm" c="dimmed" ta="center" maw={400}>
            Transform this job posting into an engaging 2-part thread hook using
            AI.
          </Text>

          <Stack gap="xs" style={{ width: "100%", maxWidth: "400px" }}>
            <Select
              value={selectedModel}
              onChange={(val) => val && setSelectedModel(val)}
              data={AI_MODELS.map((m) => ({
                value: `${m.provider}/${m.model}`,
                label: m.displayName,
              }))}
              w="100%"
            />
            <Button
              leftSection={<IconSparkles size={16} />}
              onClick={handleGenerate}
              loading={loading}
              color="indigo"
              fullWidth
            >
              Generate Content
            </Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  const modelName =
    AI_MODELS.find((m) => `${m.provider}/${m.model}` === job.ai_model_used)
      ?.displayName ||
    job.ai_model_used ||
    "Unknown Model";

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <Badge
            leftSection={<IconRobot size={12} />}
            color="indigo"
            variant="light"
          >
            Generated with {modelName}
          </Badge>
        </Group>
        <Group gap="xs">
          <CopyButton
            value={`${job.ai_thread_primary}\n\n${job.ai_thread_reply}`}
            timeout={2000}
          >
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy full thread"}
                withArrow
                position="bottom"
              >
                <ActionIcon
                  color={copied ? "teal" : "gray"}
                  variant="subtle"
                  onClick={copy}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          {/* <Tooltip label="Regenerate" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleGenerate}
              loading={loading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip> */}
          <Tooltip label="Edit" withArrow position="bottom">
            <ActionIcon variant="subtle" color="blue" onClick={onEdit}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Stack gap="sm">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Primary Hook (No Link)
        </Text>
        <Paper
          p="sm"
          radius={0}
          withBorder
          bg="dark.7"
          style={
            {
              borderWidth: "2px",
              borderColor: "var(--mantine-color-default-border)",
              padding: "var(--mantine-spacing-sm)",
            } as any
          }
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {job.ai_thread_primary}
          </Text>
        </Paper>

        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Reply Tweet (With Link)
        </Text>
        <Paper
          p="md"
          radius={0}
          withBorder
          bg="dark.7"
          style={{
            borderWidth: "2px",
            borderColor: "var(--mantine-color-default-border)",
            overflowX: "auto",
          }}
        >
          <Text
            size="sm"
            style={{ whiteSpace: "pre-wrap", minWidth: "fit-content" }}
          >
            {job.ai_thread_reply}
          </Text>
        </Paper>
      </Stack>
    </Stack>
  );
}
