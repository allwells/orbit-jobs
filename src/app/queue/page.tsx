"use client";

import {
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Tabs,
  Button,
  Loader,
  Grid,
} from "@mantine/core";
import { Sparkles, ListTodo, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Job } from "@/types/database";
import { JobCard } from "./JobCard";
import { notifications } from "@mantine/notifications";

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<string | null>("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?status=${activeTab}&limit=50`);
      const data = await res.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load jobs",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 5 }),
      });
      const data = await res.json();

      if (data.success) {
        notifications.show({
          title: "AI Processing Complete",
          message: data.message,
          color: "teal",
          icon: <Sparkles size={18} />,
        });
        // Switch to drafts to see results
        setActiveTab("draft");
      } else {
        notifications.show({
          title: "Processing Failed",
          message: data.error || "Unknown error",
          color: "red",
        });
      }
    } catch (error) {
      console.error("AI Gen Error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to connect to AI service",
        color: "red",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        notifications.show({
          title: "Updated",
          message: `Job marked as ${status}`,
          color: status === "approved" ? "teal" : "gray",
        });
        // Remove from list or refresh
        setJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update job status",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} fw={700}>
            Job Queue
          </Title>
          <Text c="dimmed" size="sm">
            Review scraped jobs, generate AI drafts, and approve for posting.
          </Text>
        </div>
        {activeTab === "pending" && (
          <Button
            leftSection={<Sparkles size={16} />}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            onClick={handleGenerate}
            loading={generating}
            disabled={jobs.length === 0}
          >
            Run AI Brain (Batch 5)
          </Button>
        )}
      </Group>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        radius="md"
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="pending" leftSection={<ListTodo size={16} />}>
            Pending
            <Badge size="xs" circle ml={6} color="gray">
              {/* count could be fetched separately */}
              Live
            </Badge>
          </Tabs.Tab>
          <Tabs.Tab
            value="draft"
            leftSection={<Sparkles size={16} />}
            c="yellow.4"
          >
            AI Drafts
          </Tabs.Tab>
          <Tabs.Tab
            value="approved"
            leftSection={<CheckCircle2 size={16} />}
            c="teal.4"
          >
            Approved
          </Tabs.Tab>
          <Tabs.Tab
            value="rejected"
            leftSection={<XCircle size={16} />}
            c="red.4"
          >
            Rejected
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab || "pending"}>
          {loading ? (
            <Group justify="center" p="xl">
              <Loader type="dots" />
            </Group>
          ) : jobs.length === 0 ? (
            <Text c="dimmed" ta="center" fs="italic" mt="xl">
              No jobs found in {activeTab}.
            </Text>
          ) : (
            <Grid>
              {jobs.map((job) => (
                <Grid.Col key={job.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <JobCard
                    job={job}
                    onApprove={(id) => handleUpdateStatus(id, "approved")}
                    onReject={(id) => handleUpdateStatus(id, "rejected")}
                    // onEdit logic can be added later
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
