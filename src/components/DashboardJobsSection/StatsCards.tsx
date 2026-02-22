import {
  SimpleGrid,
  Paper,
  Text,
  Group,
  ThemeIcon,
  Skeleton,
} from "@mantine/core";
import {
  Briefcase as IconBriefcase,
  Clock as IconClock,
  CheckCircle as IconCheck,
  X as IconBrandX, // Lucide doesn't have BrandX, use X or Twitter. Using X for now.
} from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard-actions";

interface StatsCardsProps {
  stats?: DashboardStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const data = [
    {
      label: "Total Jobs",
      stat: stats?.totalJobs || { value: 0, trend: 0 },
      icon: IconBriefcase,
      color: "blue",
    },
    {
      label: "Pending Review",
      stat: stats?.pendingReview || { value: 0, trend: 0 },
      icon: IconClock,
      color: "yellow",
    },
    {
      label: "Approved",
      stat: stats?.approved || { value: 0, trend: 0 },
      icon: IconCheck,
      color: "green",
    },
    {
      label: "Posted onto X",
      stat: stats?.postedToX || { value: 0, trend: 0 },
      icon: IconBrandX,
      color: "dark",
    },
  ];

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={140} radius={0} />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
      {data.map((item) => {
        const isPositive = item.stat.trend >= 0;
        return (
          <Paper
            withBorder
            p="md"
            radius={0}
            key={item.label}
            shadow="sm"
            bg="background.secondary"
            style={{ borderColor: "var(--mantine-color-border-default)" }}
          >
            <Group justify="space-between">
              <Text size="xs" c="text.secondary" fw={700} tt="uppercase">
                {item.label}
              </Text>
              <ThemeIcon
                color={item.color}
                variant="light"
                size="lg"
                radius={0}
              >
                <item.icon size={20} strokeWidth={1.5} />
              </ThemeIcon>
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
              <Text
                fw={700}
                style={{ fontSize: "2rem", lineHeight: 1 }}
                c="text.primary"
              >
                {item.stat.value}
              </Text>
              <Text
                c={isPositive ? "teal" : "red"}
                fw={700}
                size="sm"
                style={{ lineHeight: 1, marginBottom: 4 }}
              >
                {item.stat.trend > 0 ? "+" : ""}
                {item.stat.trend}%
              </Text>
            </Group>
            <Text size="xs" c="text.tertiary" mt={7}>
              Compared to last month
            </Text>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
