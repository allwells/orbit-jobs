"use client";

import {
  Box,
  ScrollArea,
  Text,
  ThemeIcon,
  Group,
  Badge,
  Paper,
  Stack,
  useMantineTheme,
  Button,
} from "@mantine/core";
import {
  Search,
  Check,
  X,
  Twitter,
  Zap,
  Activity as ActivityIcon,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";
import Link from "next/link";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

interface ActivityStreamProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "job_fetch":
      return <Search size={16} />;
    case "job_approved":
      return <Check size={16} />;
    case "job_rejected":
      return <X size={16} />;
    case "job_posted":
      return <Twitter size={16} />;
    case "content_generated":
      return <Zap size={16} />;
    default:
      return <ActivityIcon size={16} />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "job_fetch":
      return "blue";
    case "job_approved":
      return "teal";
    case "job_rejected":
      return "red";
    case "job_posted":
      return "indigo";
    case "content_generated":
      return "yellow";
    default:
      return "gray";
  }
};

export function ActivityStream({ activities }: ActivityStreamProps) {
  const theme = useMantineTheme();

  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Text
          size="sm"
          fw={700}
          tt="uppercase"
          c="text.secondary"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            letterSpacing: "1px",
          }}
        >
          System Activity Log
        </Text>

        <Button
          component={Link}
          href="/activity"
          variant="subtle"
          size="compact-xs"
          rightSection={<ArrowUpRight size={14} />}
          radius={0}
          c="text.secondary"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          VIEW ALL
        </Button>
      </Group>

      <Paper
        withBorder
        p="md"
        radius={0}
        h={{ base: 360, sm: 480 }}
        style={{
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.sidebar}`,
          overflow: "hidden",
        }}
      >
        {activities.length === 0 ? (
          <Stack align="center" justify="center" h="100%" gap="xs">
            <ActivityIcon
              size={40}
              strokeWidth={1.3}
              color="var(--mantine-color-dimmed)"
            />
            <Text
              fw={500}
              fz={18}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              No recent activity
            </Text>
          </Stack>
        ) : (
          <ScrollArea h="100%" type="always" scrollbarSize={0}>
            <Stack gap="sm">
              {activities.map((activity, index) => (
                <Paper
                  key={activity.id}
                  component={motion.div}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  withBorder
                  p="sm"
                  radius={0}
                  style={{
                    backgroundColor: theme.other.background.secondary,
                    border: `2px solid ${theme.other.border.sidebar}`,
                  }}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon
                      size="lg"
                      radius={0}
                      color={getActivityColor(activity.activity_type)}
                      variant="light"
                      style={{
                        border: "1px solid var(--mantine-color-default-border)",
                        backgroundColor: "transparent",
                      }}
                    >
                      {getActivityIcon(activity.activity_type)}
                    </ThemeIcon>

                    <Box style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Text
                          size="sm"
                          fw={700}
                          tt="uppercase"
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            lineHeight: 1.2,
                          }}
                          mb={4}
                        >
                          {activity.title}
                        </Text>
                        <Text
                          c="dimmed"
                          size="xs"
                          tt="uppercase"
                          style={{
                            fontFamily: "var(--font-jetbrains-mono)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDistanceToNow(
                            new Date(activity.created_at || new Date()),
                            {
                              addSuffix: true,
                            },
                          )}
                        </Text>
                      </Group>

                      <Text
                        c="text.secondary"
                        size="xs"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {activity.description}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Paper>
    </Box>
  );
}
