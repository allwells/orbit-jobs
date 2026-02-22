"use client";

import { useState } from "react";
import {
  Card,
  Text,
  Group,
  Button,
  SimpleGrid,
  Stack,
  Skeleton,
} from "@mantine/core";
import {
  RefreshCw as IconRefresh,
  ArrowRight as IconArrowRight,
  Search as IconSearch,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ActivityFeed } from "@/components/ActivityFeed";
import { RecentJobsTable } from "./RecentJobsTable";
import { JobFetchModal } from "@/components/JobFetchModal";
import { StatsCards } from "./StatsCards";

import { useDashboardData } from "@/hooks/use-dashboard-data";

export function DashboardJobsSection() {
  const router = useRouter();
  const { data, loading, error } = useDashboardData();
  const [fetchModalOpen, setFetchModalOpen] = useState(false);

  // We can still allow manual refresh of just the data if needed, but for now
  // full page reload or just calling the hook refetch (if we exposed it) would work.
  // The hook currently doesn't expose refetch, so "Refresh" button might need to reload page or we update hook.
  // For simplicity, let's just reload the page or re-mount component for "Refresh"
  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return <Text c="red">Error loading dashboard data: {error.message}</Text>;
  }

  const recentJobs = data?.recentJobs || [];
  const activities = data?.recentActivities || [];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Text fz="xl" fw={700}>
          Overview
        </Text>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="default"
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconSearch size={16} />}
            color="indigo"
            onClick={() => setFetchModalOpen(true)}
          >
            Fetch New Jobs
          </Button>
        </Group>
      </Group>

      {/* Pass stats down. If loading, StatsCards will handle it if we passed loading prop, 
          but here we wait for data? Or StatsCards handles its own fetching?
          Request was: "only 1 api call". So we must pass stats to StatsCards.
          We need to refactor StatsCards to accept props.
      */}
      <StatsCards stats={data?.stats} loading={loading} />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card
          withBorder
          radius={0}
          p="md"
          shadow="sm"
          bg="background.secondary"
          style={{ borderColor: "var(--mantine-color-border-default)" }}
        >
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg" c="text.primary">
              Recent Jobs
            </Text>
            <Button
              variant="subtle"
              size="xs"
              rightSection={<IconArrowRight size={14} />}
              onClick={() => router.push("/jobs")}
            >
              View All
            </Button>
          </Group>

          {loading ? (
            <Stack>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : recentJobs.length > 0 ? (
            <RecentJobsTable jobs={recentJobs} />
          ) : (
            <Stack align="center" py="xl" gap="md">
              <Text c="dimmed" size="sm">
                No jobs found.
              </Text>
              <Button
                variant="light"
                size="xs"
                onClick={() => setFetchModalOpen(true)}
              >
                Fetch Jobs
              </Button>
            </Stack>
          )}
        </Card>

        {/* Activity Feed */}
        <ActivityFeed initialData={activities} />
      </SimpleGrid>

      <JobFetchModal
        opened={fetchModalOpen}
        onClose={() => {
          setFetchModalOpen(false);
          handleRefresh(); // Refresh data after fetch
        }}
      />
    </Stack>
  );
}
