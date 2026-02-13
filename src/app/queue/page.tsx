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
  Card,
  ActionIcon,
  Pagination,
  Modal,
  Textarea,
  Divider,
  Box,
  ThemeIcon,
  Menu,
  ScrollArea,
} from "@mantine/core";
import {
  Sparkles,
  ListTodo,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Briefcase,
  MapPin,
  DollarSign,
  Check,
  X,
  Trash,
  RefreshCw,
  FileText,
  MoreVertical,
  Copy,
  Send,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Job } from "@/types/database";
import { notifications } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";

interface QueueStats {
  pendingJobs: number;
  draftJobs: number;
  approvedJobs: number;
  rejectedJobs: number;
}

const ITEMS_PER_PAGE = 18;

import { Suspense } from "react";

// ... (existing imports)

export default function QueuePageWrapper() {
  return (
    <Suspense fallback={<Loader />}>
      <QueuePageContent />
    </Suspense>
  );
}

function QueuePageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [scrapingDesc, setScrapingDesc] = useState(false);
  const [posting, setPosting] = useState(false);
  const clipboard = useClipboard({ timeout: 2000 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats({
        pendingJobs: data.pendingJobs,
        draftJobs: data.draftJobs,
        approvedJobs: data.approvedJobs,
        rejectedJobs: data.rejectedJobs,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?status=${activeTab}&limit=100`);
      const data = await res.json();
      setJobs(data.data || []);
      setCurrentPage(1); // Reset to first page when changing tabs
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

  // Handle deep linking from Telegram notifications
  useEffect(() => {
    const jobId = searchParams.get("job");
    if (jobId) {
      // Fetch the specific job and open modal
      fetch(`/api/jobs/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setSelectedJob(data.data);
            setModalOpened(true);
            // Switch to the appropriate tab
            setActiveTab(data.data.status);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch job from deep link:", error);
          notifications.show({
            title: "Error",
            message: "Job not found",
            color: "red",
          });
        });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [fetchJobs, fetchStats]);

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
        setActiveTab("draft");
        fetchStats();
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

  const handleGenerateSingle = async (id: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        notifications.show({
          title: "Job Processed",
          message: "AI content generated successfully",
          color: "teal",
          icon: <Sparkles size={18} />,
        });
        setModalOpened(false);
        setActiveTab("draft");
        fetchStats();
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
        setJobs((prev) => prev.filter((j) => j.id !== id));
        setModalOpened(false);
        fetchStats();
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

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        if (selectedJob?.id === id) setModalOpened(false);
        notifications.show({
          title: "Deleted",
          message: "Job deleted",
          color: "gray",
        });
        fetchStats();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete job",
        color: "red",
      });
    }
  };

  const handleScrapeDescription = async () => {
    if (!selectedJob) return;
    setScrapingDesc(true);
    try {
      const res = await fetch("/api/scraper/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedJob.id,
          url: selectedJob.url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newDesc = data.description;
        setSelectedJob((prev) =>
          prev ? { ...prev, description: newDesc } : null,
        );
        setJobs((prev) =>
          prev.map((j) =>
            j.id === selectedJob.id ? { ...j, description: newDesc } : j,
          ),
        );
        notifications.show({
          title: "Success",
          message: "Job description scraped",
          color: "teal",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to scrape description",
        color: "red",
      });
    } finally {
      setScrapingDesc(false);
    }
  };

  const handleCopyContent = () => {
    if (!selectedJob) return;

    // Combine all AI content
    const content = [
      selectedJob.ai_hook,
      ...(Array.isArray(selectedJob.ai_thread) ? selectedJob.ai_thread : []),
      selectedJob.ai_reply,
    ]
      .filter(Boolean)
      .join("\n\n");

    clipboard.copy(content);
    notifications.show({
      title: "Copied!",
      message: "Content copied to clipboard",
      color: "teal",
    });
  };

  const handlePostToX = async () => {
    if (!selectedJob) return;

    // Combine all AI content
    const content = [
      selectedJob.ai_hook,
      ...(Array.isArray(selectedJob.ai_thread) ? selectedJob.ai_thread : []),
      selectedJob.ai_reply,
    ]
      .filter(Boolean)
      .join("\n\n");

    setPosting(true);
    try {
      const res = await fetch("/api/twitter/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          content,
        }),
      });

      const data = await res.json();

      if (data.success) {
        notifications.show({
          title: "Posted!",
          message: `Tweet posted successfully. ${data.remainingPosts} posts remaining this month.`,
          color: "teal",
        });
        // Refresh jobs to update status
        fetchJobs();
        setModalOpened(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to post to X",
        color: "red",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleCardClick = (job: Job) => {
    setSelectedJob(job);
    setModalOpened(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedJobs = jobs.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "yellow";
      case "approved":
        return "teal";
      case "posted":
        return "blue";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2} fw={700}>
            Job Queue
          </Title>
          <Text c="dimmed" size="sm">
            Review scraped jobs, generate AI drafts, and approve for posting.
          </Text>
        </Stack>

        {activeTab === "pending" && (
          <Button
            leftSection={<Sparkles size={16} />}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            onClick={handleGenerate}
            loading={generating}
            disabled
          >
            Run AI Brain (Batch 5)
          </Button>
        )}
      </Group>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="outline"
        radius="md"
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="pending" leftSection={<ListTodo size={16} />}>
            <Group gap="xs">
              <span className={activeTab !== "pending" ? "hide-on-mobile" : ""}>
                Pending
              </span>
              <Badge size="sm" circle color="gray">
                {stats?.pendingJobs ?? 0}
              </Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab
            value="draft"
            leftSection={<Sparkles size={16} />}
            c="yellow.4"
          >
            <Group gap="xs">
              <span className={activeTab !== "draft" ? "hide-on-mobile" : ""}>
                AI Drafts
              </span>
              <Badge size="sm" circle color="yellow">
                {stats?.draftJobs ?? 0}
              </Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab
            value="approved"
            leftSection={<CheckCircle2 size={16} />}
            c="teal.4"
          >
            <Group gap="xs">
              <span
                className={activeTab !== "approved" ? "hide-on-mobile" : ""}
              >
                Approved
              </span>
              <Badge size="sm" circle color="teal">
                {stats?.approvedJobs ?? 0}
              </Badge>
            </Group>
          </Tabs.Tab>
          <Tabs.Tab
            value="rejected"
            leftSection={<XCircle size={16} />}
            c="red.4"
          >
            <Group gap="xs">
              <span
                className={activeTab !== "rejected" ? "hide-on-mobile" : ""}
              >
                Rejected
              </span>
              <Badge size="sm" circle color="red">
                {stats?.rejectedJobs ?? 0}
              </Badge>
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab || "pending"}>
          {loading ? (
            <Group justify="center" p="xl">
              <Loader type="dots" />
            </Group>
          ) : jobs.length === 0 ? (
            <Card p="xl" radius="md" withBorder>
              <Stack align="center" gap="md">
                <ThemeIcon variant="light" color="gray" size={60} radius="xl">
                  <ListTodo size={28} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg" ta="center">
                    No jobs found
                  </Text>
                  <Text c="dimmed" size="sm" ta="center" mt={4}>
                    No jobs in {activeTab} status.
                  </Text>
                </div>
              </Stack>
            </Card>
          ) : (
            <>
              <Grid gutter="md">
                {paginatedJobs.map((job) => (
                  <Grid.Col key={job.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onClick={() => handleCardClick(job)}
                      className="job-card-hover"
                    >
                      <Stack gap="sm" style={{ flex: 1 }}>
                        {/* Header with Title and Link */}
                        <Group
                          justify="space-between"
                          wrap="nowrap"
                          align="flex-start"
                        >
                          <Text
                            fw={600}
                            size="md"
                            lineClamp={2}
                            style={{ flex: 1 }}
                          >
                            {job.title}
                          </Text>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            component="a"
                            href={job.url}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            mt={2}
                          >
                            <ExternalLink size={16} />
                          </ActionIcon>

                          <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={(e) => e.stopPropagation()}
                                mt={2}
                              >
                                <MoreVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<Trash size={14} />}
                                color="red"
                                disabled
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // handleDeleteJob(job.id);
                                }}
                              >
                                Delete Job
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>

                        {/* Company & Location */}
                        <Stack gap={4}>
                          <Group gap={6}>
                            <Briefcase size={14} />
                            <Text size="sm" c="dimmed">
                              {job.company}
                            </Text>
                          </Group>
                          {job.location && (
                            <Group gap={6}>
                              <MapPin size={14} />
                              <Text size="sm" c="dimmed">
                                {job.location}
                              </Text>
                            </Group>
                          )}
                          {job.salary && (
                            <Group gap={6}>
                              <DollarSign size={14} />
                              <Text size="sm" c="dimmed">
                                {job.salary}
                              </Text>
                            </Group>
                          )}
                        </Stack>

                        {/* AI Indicator */}
                        {job.status === "draft" && job.ai_hook && (
                          <Box
                            p="xs"
                            bg="var(--mantine-color-dark-6)"
                            style={{ borderRadius: 6 }}
                          >
                            <Group gap={6} mb={4}>
                              <Sparkles
                                size={12}
                                color="var(--mantine-color-yellow-4)"
                              />
                              <Text size="xs" fw={600} c="yellow.4">
                                AI GENERATED
                              </Text>
                            </Group>
                            <Text
                              size="xs"
                              c="dimmed"
                              lineClamp={2}
                              fs="italic"
                            >
                              "{job.ai_hook}"
                            </Text>
                          </Box>
                        )}

                        {/* Spacer */}
                        <div style={{ flex: 1 }} />

                        {/* View Details Button */}
                        {/* <Button
                          variant="light"
                          fullWidth
                          size="xs"
                          leftSection={<Eye size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(job);
                          }}
                        >
                          View Details
                        </Button> */}
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="xl">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="md"
                  />
                </Group>
              )}
            </>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Detail Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <Text fw={700} size="lg">
              Job Details
            </Text>
            {selectedJob && (
              <Badge color={getStatusColor(selectedJob.status)} variant="light">
                {selectedJob.status}
              </Badge>
            )}
          </Group>
        }
        size="xl"
      >
        {selectedJob && (
          <Stack gap="md">
            {/* Job Info */}
            <div>
              <Text fw={600} size="xl" mb="xs">
                {selectedJob.title}
              </Text>
              <Stack gap={6}>
                <Group gap={8}>
                  <Briefcase size={16} />
                  <Text size="sm">{selectedJob.company}</Text>
                </Group>
                {selectedJob.location && (
                  <Group gap={8}>
                    <MapPin size={16} />
                    <Text size="sm">{selectedJob.location}</Text>
                  </Group>
                )}
                {selectedJob.salary && (
                  <Group gap={8}>
                    <DollarSign size={16} />
                    <Text size="sm">{selectedJob.salary}</Text>
                  </Group>
                )}
                <Group gap={8}>
                  <ExternalLink size={16} />
                  <Text
                    size="sm"
                    component="a"
                    href={selectedJob.url}
                    target="_blank"
                    c="blue"
                    style={{ textDecoration: "none" }}
                  >
                    View
                  </Text>
                </Group>
                <Group>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<FileText size={14} />}
                    onClick={handleScrapeDescription}
                    loading={scrapingDesc}
                    disabled
                  >
                    {selectedJob.description
                      ? "Description Scraped"
                      : "Scrape Description"}
                  </Button>
                </Group>
              </Stack>
            </div>

            {selectedJob.description && (
              <>
                <Divider />
                <div>
                  <Text fw={600} size="sm" mb="xs">
                    Description
                  </Text>
                  <ScrollArea.Autosize mah={200}>
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedJob.description}
                    </Text>
                  </ScrollArea.Autosize>
                </div>
              </>
            )}

            <Divider />

            {/* AI Generated Content */}
            {selectedJob.status === "draft" && (
              <>
                <div>
                  <Group gap={8} mb="xs">
                    <Sparkles size={18} color="var(--mantine-color-yellow-4)" />
                    <Text fw={700} c="yellow.4">
                      AI GENERATED CONTENT
                    </Text>
                  </Group>

                  <Stack gap="sm">
                    <div>
                      <Text size="sm" fw={600} mb={4}>
                        Hook Tweet
                      </Text>
                      <Textarea
                        value={selectedJob.ai_hook || ""}
                        readOnly
                        autosize
                        minRows={2}
                      />
                    </div>

                    <div>
                      <Text size="sm" fw={600} mb={4}>
                        Thread
                      </Text>
                      <Stack gap="xs">
                        {(Array.isArray(selectedJob.ai_thread)
                          ? selectedJob.ai_thread
                          : []
                        ).map((tweet, i) => (
                          <Textarea
                            key={i}
                            value={tweet}
                            readOnly
                            autosize
                            minRows={2}
                            label={`Tweet ${i + 1}`}
                          />
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Text size="sm" fw={600} mb={4}>
                        Reply Tweet
                      </Text>
                      <Textarea
                        value={selectedJob.ai_reply || ""}
                        readOnly
                        autosize
                        minRows={2}
                      />
                    </div>

                    {selectedJob.ai_analysis && (
                      <div>
                        <Text size="sm" fw={600} mb={4}>
                          AI Analysis
                        </Text>
                        <Textarea
                          value={selectedJob.ai_analysis}
                          readOnly
                          autosize
                          minRows={2}
                        />
                      </div>
                    )}
                  </Stack>
                </div>

                {/* Copy and Post Buttons */}
                <Group mt="md" justify="space-between">
                  <Button
                    variant="light"
                    leftSection={<Copy size={16} />}
                    onClick={handleCopyContent}
                    color={clipboard.copied ? "teal" : "blue"}
                  >
                    {clipboard.copied ? "Copied!" : "Copy Content"}
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    leftSection={<Send size={16} />}
                    onClick={handlePostToX}
                    loading={posting}
                    disabled
                  >
                    Post to X
                  </Button>
                </Group>

                <Divider />
              </>
            )}

            {/* Actions */}
            {/* Actions */}
            <Group justify="space-between" mt="md">
              <Group>
                {(selectedJob.status === "pending" ||
                  selectedJob.status === "rejected") && (
                  <Button
                    variant="gradient"
                    gradient={{ from: "indigo", to: "cyan" }}
                    leftSection={<Sparkles size={16} />}
                    loading={generating}
                    onClick={() => handleGenerateSingle(selectedJob.id)}
                    disabled
                  >
                    Run AI Brain
                  </Button>
                )}
                {selectedJob.status === "approved" && (
                  <Button
                    variant="outline"
                    color="indigo"
                    leftSection={<RefreshCw size={16} />}
                    loading={generating}
                    onClick={() => handleGenerateSingle(selectedJob.id)}
                    disabled
                  >
                    Re-run AI Brain
                  </Button>
                )}
              </Group>

              <Group gap="sm">
                {selectedJob.status !== "rejected" && (
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<X size={16} />}
                    onClick={() =>
                      handleUpdateStatus(selectedJob.id, "rejected")
                    }
                    disabled
                  >
                    Reject
                  </Button>
                )}
                {selectedJob.status === "draft" && (
                  <Button
                    color="teal"
                    leftSection={<Check size={16} />}
                    onClick={() =>
                      handleUpdateStatus(selectedJob.id, "approved")
                    }
                    disabled
                  >
                    Approve & Queue
                  </Button>
                )}
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>

      <style jsx global>{`
        .job-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </Stack>
  );
}
