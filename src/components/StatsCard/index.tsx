"use client";

import {
  Box,
  Paper,
  Text,
  ThemeIcon,
  Group,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
  gradient: string;
}

export function StatsCard({
  label,
  value,
  trend,
  icon,
  gradient,
}: StatsCardProps) {
  const theme = useMantineTheme();

  return (
    <Paper
      withBorder
      p="lg"
      radius={0}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme.other.background.secondary,
        border: `2px solid ${theme.other.border.sidebar}`,
      }}
    >
      {/* Gradient Overlay - reduced opacity for brutalist feel */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradient,
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Stack gap="xs" style={{ position: "relative", zIndex: 1 }}>
        <Group justify="space-between" align="flex-start">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            c="text.secondary"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </Text>
          <ThemeIcon
            size="lg"
            radius={0}
            variant="outline"
            style={{
              color: theme.other.text.secondary,
              border: `1px solid ${theme.other.border.sidebar}`,
              backgroundColor: theme.other.border.sidebar,
            }}
          >
            {icon}
          </ThemeIcon>
        </Group>

        <Group align="flex-end" gap="sm">
          <Text
            size="xl"
            fw={700}
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "2rem",
              lineHeight: 1,
            }}
          >
            {value}
          </Text>
          {trend && (
            <Group gap={2} mb={4}>
              {trend.value >= 0 ? (
                <ArrowUpRight size={16} color="var(--mantine-color-teal-5)" />
              ) : (
                <ArrowDownRight size={16} color="var(--mantine-color-red-5)" />
              )}
              <Text
                size="sm"
                c={trend.value >= 0 ? "teal.5" : "red.5"}
                fw={700}
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {trend.value}%
              </Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
