"use client";

import { PieChart } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { getBrutalistTooltip } from "./chartUtils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Paper, Text, Stack, Box, useMantineTheme } from "@mantine/core";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatusChartProps {
  data: {
    pending: number;
    approved: number;
    rejected: number;
    posted: number;
  };
}

export function StatusChart({ data }: StatusChartProps) {
  const theme = useMantineTheme();

  const total = data.pending + data.approved + data.rejected + data.posted;
  const isEmpty = total === 0;

  if (isEmpty) {
    return (
      <Box>
        <Text
          mb="md"
          size="sm"
          fw={700}
          tt="uppercase"
          c="text.secondary"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            letterSpacing: "1px",
            color: theme.other.text.primary,
          }}
        >
          Job Status Distribution
        </Text>

        <Paper
          withBorder
          p="md"
          radius={0}
          h={{ base: 360, sm: 480 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack align="center" gap="xs">
            <PieChart
              size={40}
              strokeWidth={1.3}
              color="var(--mantine-color-dimmed)"
            />
            <Text
              fw={500}
              fz={18}
              c="dimmed"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              No data available
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const chartData = {
    labels: ["Pending", "Approved", "Rejected", "Posted"],
    datasets: [
      {
        data: [data.pending, data.approved, data.rejected, data.posted],
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)", // Pending - Yellow
          "rgba(75, 192, 192, 0.6)", // Approved - Green
          "rgba(255, 99, 132, 0.6)", // Rejected - Red
          "rgba(54, 162, 235, 0.6)", // Posted - Blue
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            family: "JetBrains Mono",
          },
        },
      },
      tooltip: getBrutalistTooltip(),
    },
    cutout: "0%",
  };

  return (
    <Box>
      <Text
        mb="md"
        size="sm"
        fw={700}
        tt="uppercase"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          letterSpacing: "1px",
          color: theme.other.text.primary,
        }}
      >
        Job Status Distribution
      </Text>

      <Paper withBorder p="md" radius={0} h={{ base: 360, sm: 480 }}>
        <Doughnut data={chartData} options={options} />
      </Paper>
    </Box>
  );
}
