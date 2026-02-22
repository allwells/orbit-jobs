import {
  Container,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Box,
  Paper,
} from "@mantine/core";
import { getDashboardOverview } from "@/lib/analytics-service";
import { StatsCard } from "@/components/StatsCard";
import { ActivityStream } from "@/components/ActivityStream";
import { DashboardJobs } from "@/components/DashboardJobsSection/DashboardJobs";
import { Search, Clock, Twitter, Zap } from "lucide-react";
import { JobsChart } from "@/components/Analytics/Charts/JobsChart";
import { StatusChart } from "@/components/Analytics/Charts/StatusChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { analytics, recentJobs, recentActivities } =
    await getDashboardOverview();
  const { stats, charts } = analytics;

  return (
    <Container fluid style={{ maxWidth: 1920 }} py="lg" px={0} w="100%">
      <Stack gap="lg" mb="lg">
        <Box>
          <Title
            order={1}
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            mb={4}
          >
            MISSION CONTROL
          </Title>

          <Text c="text.secondary">
            System Status:{" "}
            <Text span c="green.5" fw={700}>
              OPERATIONAL
            </Text>
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="lg">
          <StatsCard
            label="Total Jobs Fetched"
            value={stats.totalFetched}
            gradient="linear-gradient(135deg, #1A1B1E 0%, #25262B 100%)"
            icon={<Search size={20} strokeWidth={1.5} />}
          />
          <StatsCard
            label="Pending Review"
            value={stats.pending}
            gradient="linear-gradient(135deg, rgba(250, 176, 5, 0.1) 0%, rgba(250, 176, 5, 0.05) 100%)"
            icon={<Clock size={20} strokeWidth={1.5} />}
          />
          <StatsCard
            label="Post-Ready"
            value={stats.postReady}
            gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)"
            icon={<Zap size={20} strokeWidth={1.5} />}
          />
          <StatsCard
            label="Posted to X"
            value={stats.posted}
            gradient="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)"
            icon={<Twitter size={20} strokeWidth={1.5} />}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
          <Box>
            <DashboardJobs jobs={recentJobs} />
          </Box>
          <Box>
            <ActivityStream activities={recentActivities} />
          </Box>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
          <Box>
            <JobsChart data={charts.jobs} />
          </Box>
          <Box>
            <StatusChart data={charts.status} />
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
