"use client";

import { ReactNode } from "react";
import { Paper, Group, Box, Title, Text, useMantineTheme } from "@mantine/core";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  rightSection?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  rightSection,
}: PageHeaderProps) {
  const theme = useMantineTheme();

  return (
    <Paper p="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Group wrap="nowrap" style={{ flex: 1, minWidth: "280px" }}>
          <Box
            p="xs"
            bg="brand.7"
            style={{
              border: "2px solid var(--mantine-color-brand-5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box style={{ flex: 1 }}>
            <Title
              order={2}
              tt="uppercase"
              fz={{ base: "lg", sm: "xl" }}
              lineClamp={1}
            >
              {title}
            </Title>

            <Text c="dimmed" size="xs" lineClamp={1}>
              {description}
            </Text>
          </Box>
        </Group>

        {rightSection && (
          <Box w={{ base: "100%", sm: "auto" }}>{rightSection}</Box>
        )}
      </Group>
    </Paper>
  );
}
