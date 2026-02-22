"use client";

import {
  Paper,
  Text,
  Stack,
  Group,
  Badge,
  ScrollArea,
  Button,
  ThemeIcon,
  Box,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Database } from "@/types/database";
import { JobDetailModal } from "@/components/JobDetailModal";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

interface DashboardJobsProps {
  jobs: Job[];
}

export function DashboardJobs({ jobs }: DashboardJobsProps) {
  const theme = useMantineTheme();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    open();
  };

  return (
    <Box>
      <JobDetailModal
        opened={opened}
        onClose={close}
        job={selectedJob as any}
      />
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
          Recent Jobs
        </Text>
        <Button
          component={Link}
          href="/jobs"
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
        {jobs.length === 0 ? (
          <Stack align="center" justify="center" h="100%" gap="xs">
            <Briefcase
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
              No recent jobs
            </Text>
          </Stack>
        ) : (
          <ScrollArea h="100%" type="always" scrollbarSize={0}>
            <Stack gap="sm">
              {jobs.map((job, index) => (
                <DashboardJobsCard
                  key={job.id}
                  job={job}
                  index={index}
                  onClick={() => handleCardClick(job)}
                />
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Paper>
    </Box>
  );
}

function DashboardJobsCard({
  job,
  index,
  onClick,
}: {
  job: Job;
  index: number;
  onClick: () => void;
}) {
  const theme = useMantineTheme();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "teal";
      case "rejected":
        return "red";
      case "posted":
        return "indigo";
      default:
        return "yellow";
    }
  };

  return (
    <Paper
      key={job.id}
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      withBorder
      p="sm"
      radius={0}
      onClick={onClick}
      style={{
        backgroundColor: theme.other.background.secondary,
        border: `2px solid ${theme.other.border.sidebar}`,
        cursor: "pointer",
        transition: "transform 0.1s ease, background-color 0.1s ease",
      }}
      className="dashboard-job-card"
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ThemeIcon
            size="lg"
            radius={0}
            variant="outline"
            color="gray"
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              flexShrink: 0,
            }}
          >
            <Briefcase size={18} />
          </ThemeIcon>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              fw={700}
              size="sm"
              lineClamp={2}
              title={job.title}
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                lineHeight: 1.2,
              }}
            >
              {job.title}
            </Text>
            <Text
              size="xs"
              c="dimmed"
              lineClamp={1}
              tt="uppercase"
              fw={600}
              mt={2}
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {job.company}
            </Text>
          </Box>
        </Group>

        <Stack align="flex-end" flex="0 0 auto" gap={4} ml="xs">
          <Badge
            size="calc(0.65rem + 0.1vw)"
            variant="outline"
            color={getStatusColor(job.status)}
            radius={0}
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              borderWidth: "1.5px",
              padding: "0 6px",
            }}
          >
            {job.status}
          </Badge>

          <Text
            size="10px"
            c="dimmed"
            tt="uppercase"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              whiteSpace: "nowrap",
            }}
          >
            {job.created_at
              ? formatDistanceToNow(new Date(job.created_at), {
                  addSuffix: true,
                })
              : "Recently"}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
