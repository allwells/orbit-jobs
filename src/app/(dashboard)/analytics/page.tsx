import { Stack, SimpleGrid, Container, Box } from "@mantine/core";
import { BarChart3 } from "lucide-react";
import { getAnalyticsData } from "@/lib/analytics-service";
import { JobsChart } from "@/components/Analytics/Charts/JobsChart";
import { StatusChart } from "@/components/Analytics/Charts/StatusChart";
import { SalaryChart } from "@/components/Analytics/Charts/SalaryChart";
import { PageHeader } from "@/components/Shared/PageHeader";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { charts } = await getAnalyticsData();

  return (
    <Container fluid style={{ maxWidth: 1920 }} p={0} w="100%">
      <Stack gap="lg" pb="xl">
        <PageHeader
          title="Analytics"
          description="Detailed visualization of job data and system metrics"
          icon={<BarChart3 size={24} color="white" />}
        />

        <Box>
          <JobsChart data={charts.jobs} />
        </Box>
        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
          <StatusChart data={charts.status} />
          <SalaryChart data={charts.salary} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
