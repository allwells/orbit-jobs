import {
  Modal,
  Button,
  TextInput,
  Select,
  NumberInput,
  MultiSelect,
  Group,
  Stack,
  Text,
  Badge,
  Alert,
  Loader,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Search as IconSearch,
  AlertCircle as IconAlertCircle,
  Check as IconCheck,
} from "lucide-react"; // Using tabler icons as they are standard with Mantine
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchJobsAction } from "@/app/actions/job-actions";
import { useJobFetchConfig } from "./use-job-fetch-config";
import {
  EMPLOYMENT_TYPES,
  DATE_POSTED_OPTIONS,
  DEFAULT_CONFIG,
} from "./constants";
import type { JobFetchConfig } from "./types";
import { formatDistanceToNow } from "date-fns";

interface JobFetchModalProps {
  opened: boolean;
  onClose: () => void;
}

export function JobFetchModal({ opened, onClose }: JobFetchModalProps) {
  const { user } = useAuth();
  const {
    config,
    loading: configLoading,
    lastRunStats,
    saveConfig,
  } = useJobFetchConfig();
  const [fetching, setFetching] = useState(false);

  const form = useForm<JobFetchConfig>({
    initialValues: DEFAULT_CONFIG,
    validate: {
      search_query: (value: string) =>
        value.trim().length === 0 ? "Search query is required" : null,
      num_results: (value: number) =>
        value < 5 || value > 100 ? "Must be between 5 and 100" : null,
    },
  });

  // Load config into form when available
  useEffect(() => {
    if (!configLoading && config) {
      form.setValues(config);
    }
  }, [config, configLoading]);

  const handleSubmit = async (values: JobFetchConfig) => {
    if (!user) return;

    try {
      setFetching(true);

      // 1. Save configuration
      await saveConfig(values);

      // 2. Execute Fetch via Server Action
      const result = await fetchJobsAction({
        search_query: values.search_query,
        location: values.location,
        remote_only: values.remote_only,
        employment_types: values.employment_types,
        date_posted: values.date_posted || undefined,
        num_results: values.num_results,
        provider: values.provider,
      });

      notifications.show({
        title: "Fetch Completed",
        message: `Found ${result.totalFetched} jobs (${result.newJobs} new, ${result.duplicates} duplicates skipped).`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      onClose();
      // router.push("/jobs"); // No need to push, we are likely already there or can stay on dashboard
      // router.refresh(); // Action calls revalidatePath, but client refresh might be needed to see updates immediately
    } catch (error) {
      notifications.show({
        title: "Fetch Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Fetch New Jobs</Text>}
      size="lg"
      closeOnClickOutside={!fetching}
      closeOnEscape={!fetching}
    >
      {configLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* Main Search */}
            <TextInput
              label="Search Query"
              placeholder="e.g. Remote React Developer"
              required
              leftSection={<IconSearch size={16} />}
              {...form.getInputProps("search_query")}
            />

            <Select
              label="API Provider"
              data={[
                { value: "jsearch", label: "JSearch (RapidAPI)" },
                { value: "adzuna", label: "Adzuna" },
                { value: "remotive", label: "Remotive.io" },
                { value: "remoteok", label: "Remote OK" },
              ]}
              allowDeselect={false}
              {...form.getInputProps("provider")}
            />

            <Group grow align="flex-start">
              <TextInput
                label="Location"
                placeholder="e.g. New York, or leave empty"
                {...form.getInputProps("location")}
              />
              <Select
                label="Date Posted"
                data={DATE_POSTED_OPTIONS}
                allowDeselect={false}
                {...form.getInputProps("date_posted")}
              />
            </Group>

            <Group grow align="flex-start">
              <MultiSelect
                label="Employment Type"
                data={EMPLOYMENT_TYPES}
                placeholder="Select types"
                {...form.getInputProps("employment_types")}
              />
              <Select
                label="Work Setting"
                data={[
                  { value: "true", label: "Remote Only" },
                  { value: "false", label: "All Settings" },
                ]}
                value={form.values.remote_only ? "true" : "false"}
                onChange={(val) =>
                  form.setFieldValue("remote_only", val === "true")
                }
                allowDeselect={false}
              />
            </Group>

            <Group align="flex-end">
              <NumberInput
                label="Max Results (Approx)"
                min={5}
                max={100}
                description="1 API request per 10 results"
                {...form.getInputProps("num_results")}
                style={{ flex: 1 }}
              />
              <Button
                variant="light"
                color="gray"
                onClick={() => form.setValues(DEFAULT_CONFIG)}
              >
                Reset Defaults
              </Button>
            </Group>

            {/* Stats Section */}
            {lastRunStats && lastRunStats.last_run_at && (
              <>
                <Divider label="Last Run Stats" labelPosition="center" />
                <Group justify="space-between" align="center">
                  <Text size="sm" c="dimmed">
                    Run{" "}
                    {formatDistanceToNow(new Date(lastRunStats.last_run_at), {
                      addSuffix: true,
                    })}
                  </Text>
                  <Group gap="xs">
                    <Badge color="blue" variant="light">
                      {lastRunStats.last_run_results_count} Fetched
                    </Badge>
                    <Badge color="green" variant="light">
                      {lastRunStats.last_run_new_jobs} New
                    </Badge>
                    <Badge color="orange" variant="light">
                      {lastRunStats.last_run_duplicates} Dupes
                    </Badge>
                  </Group>
                </Group>
              </>
            )}

            <Alert
              icon={<IconAlertCircle size={16} />}
              title="API Usage Warning"
              color="blue"
              variant="light"
            >
              <Text size="xs">
                This action consumes your JSearch API quota. You have 50
                requests/month on the free plan. Each 10 jobs = 1 request.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose} disabled={fetching}>
                Cancel
              </Button>
              <Button type="submit" loading={fetching} color="indigo">
                Fetch Jobs
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
