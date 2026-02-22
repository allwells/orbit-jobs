"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Paper, Text, Stack, Box, useMantineTheme } from "@mantine/core";
import { TrendingUp } from "lucide-react";
import { getBrutalistTooltip } from "./chartUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface JobsChartProps {
  data: {
    labels: string[];
    newJobs: number[];
    duplicates: number[];
  };
}

export function JobsChart({ data }: JobsChartProps) {
  const theme = useMantineTheme();

  const totalJobs =
    data.newJobs.reduce((a, b) => a + b, 0) +
    data.duplicates.reduce((a, b) => a + b, 0);
  const isEmpty = totalJobs === 0;

  if (isEmpty) {
    return (
      <Box>
        <Text
          mb="md"
          size="sm"
          fw={700}
          tt="uppercase"
          style={{
            color: theme.other.text.primary,
            fontFamily: "var(--font-jetbrains-mono)",
            letterSpacing: "1px",
          }}
        >
          Job Fetch Trends
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
            <TrendingUp
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
    labels: data.labels,
    datasets: [
      {
        label: "New Jobs",
        data: data.newJobs,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: "Duplicates",
        data: data.duplicates,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "JetBrains Mono",
          },
        },
      },
      tooltip: getBrutalistTooltip(),
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(128, 128, 128, 0.2)",
        },
        ticks: {
          stepSize: 1,
          font: {
            family: "JetBrains Mono",
          },
        },
        border: {
          display: true,
          color: "rgba(128, 128, 128, 0.2)",
        },
      },
      x: {
        grid: {
          display: false,
          color: "rgba(128, 128, 128, 0.1)",
        },
        ticks: {
          font: {
            family: "JetBrains Mono",
          },
        },
        border: {
          display: false,
          color: "rgba(128, 128, 128, 0.2)",
        },
      },
    },
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
        Job Fetch Trends
      </Text>

      <Paper withBorder p="md" radius={0} h={{ base: 360, sm: 480 }}>
        <Line data={chartData} options={options} />
      </Paper>
    </Box>
  );
}
