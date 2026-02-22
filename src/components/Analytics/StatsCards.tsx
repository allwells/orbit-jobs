import {
  SimpleGrid,
  Paper,
  Group,
  Text,
  ThemeIcon,
  RingProgress,
  Center,
} from "@mantine/core";
// Using tabler icons for consistency if available, otherwise switch to lucide
// Based on previous files, we use lucide-react mostly but sometimes tabler.
// Let's us lucide-react to be safe and consistent with recent changes.
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Twitter,
  BarChart3,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalFetched: number;
    pending: number;
    approved: number;
    rejected: number;
    posted: number;
    approvalRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const data = [
    {
      label: "Total Jobs",
      value: stats.totalFetched,
      icon: Briefcase,
      color: "blue",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Posted to X",
      value: stats.posted,
      icon: Twitter,
      color: "cyan",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      {data.map((stat) => (
        <Paper key={stat.label} withBorder p="md" radius="md">
          <Group justify="space-between">
            <div>
              <Text c="dimmed" tt="uppercase" fw={700} size="xs">
                {stat.label}
              </Text>
              <Text fw={700} size="xl">
                {stat.value}
              </Text>
            </div>
            <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
              <stat.icon size={28} strokeWidth={1.5} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
