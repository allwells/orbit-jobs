"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BadgeDollarSign } from "lucide-react";
import { getBrutalistTooltip } from "./chartUtils";
import { Paper, Text, Stack, Box, useMantineTheme } from "@mantine/core";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalaryChartProps {
  data: {
    labels: string[];
    counts: number[];
  };
}

export function SalaryChart({ data }: SalaryChartProps) {
  const theme = useMantineTheme();

  const total = data.counts.reduce((a, b) => a + b, 0);
  const isEmpty = total === 0;

  if (isEmpty) {
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
          Salary Distribution (USD)
        </Text>

        <Paper
          p="md"
          h={480}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack align="center" gap="xs">
            <BadgeDollarSign
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
        label: "Jobs count",
        data: data.counts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        ...getBrutalistTooltip(),
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${context.parsed.y} jobs`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { family: "JetBrains Mono" },
        },
        grid: {
          color: "rgba(128, 128, 128, 0.2)",
        },
        border: {
          display: true,
          color: "rgba(128, 128, 128, 0.2)",
        },
      },
      x: {
        ticks: { font: { family: "JetBrains Mono" } },
        grid: {
          display: false,
          color: "rgba(128, 128, 128, 0.1)",
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
        Salary Distribution (USD)
      </Text>

      <Paper p="md" h={480}>
        <Bar data={chartData} options={options} />
      </Paper>
    </Box>
  );
}
