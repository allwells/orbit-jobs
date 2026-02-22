"use client";

import {
  Text,
  Group,
  Button,
  SegmentedControl,
  Stack,
  Drawer,
  Box,
  Pagination,
  Card,
  Center,
  Popover,
  Indicator,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PageHeader } from "@/components/Shared/PageHeader";
import {
  Briefcase,
  Search as IconSearch,
  Filter as IconFilter,
} from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Hooks
import { useJobs } from "@/hooks/use-jobs";
import { useJobSelection } from "@/hooks/use-job-selection";
import type { JobFilterParams, Job } from "@/types/job";

// Components
import { JobFetchModal } from "@/components/JobFetchModal";
import { JobFilters } from "@/components/JobFilters";
import { JobsTable } from "@/components/JobsTable";
import { JobsGrid } from "@/components/JobsGrid";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { JobDetailModal } from "@/components/JobDetailModal";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  deleteJobAction,
  deleteJobsBulkAction,
  updateJobsStatusBulkAction,
} from "@/app/actions/job-actions";

import { Suspense } from "react";

function JobsContent() {
  // State
  const [fetchModalOpen, setFetchModalOpen] = useState(false);
  const [detailModalOpen, { open: openDetailModal, close: closeDetailModal }] =
    useDisclosure(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [filtersOpen, { toggle: toggleFilters, close: closeFilters }] =
    useDisclosure(false);
  const [filters, setFilters] = useState<JobFilterParams>({
    sortBy: "date_desc",
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [isProcessingApproved, setIsProcessingApproved] = useState(false);
  const [isProcessingRejected, setIsProcessingRejected] = useState(false);
  const [isProcessingDeleted, setIsProcessingDeleted] = useState(false);
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(
    new Set(),
  );

  // Hooks
  const { jobs, totalCount, loading, refetch } = useJobs(
    filters,
    page,
    pageSize,
  );
  const {
    selectedJobIds,
    selectedCount,
    toggleJobSelection,
    selectAll,
    clearSelection,
  } = useJobSelection();

  const searchParams = useSearchParams();
  const router = useRouter();
  const jobIdFromUrl = searchParams.get("jobId");

  const activeFilterCount = [
    filters.search?.trim(),
    filters.status && filters.status.length > 0,
    filters.remote && filters.remote !== "all",
    filters.salaryMin !== undefined && filters.salaryMin !== null,
    filters.salaryMax !== undefined && filters.salaryMax !== null,
    filters.dateAdded && filters.dateAdded !== "all",
    filters.employmentTypes && filters.employmentTypes.length > 0,
  ].filter(Boolean).length;

  // Sync filters from URL on mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const initialFilters: JobFilterParams = {
      sortBy: (params.sortBy as string) || "date_desc",
      search: params.search || "",
      remote: (params.remote as any) || "all",
      dateAdded: (params.dateAdded as any) || "all",
      status: params.status ? (params.status.split(",") as any) : [],
      employmentTypes: params.employmentTypes
        ? params.employmentTypes.split(",")
        : [],
      salaryMin: params.salaryMin ? Number(params.salaryMin) : undefined,
      salaryMax: params.salaryMax ? Number(params.salaryMax) : undefined,
    };
    setFilters(initialFilters);

    if (params.page) {
      setPage(Number(params.page));
    }
  }, []); // Only runs once on mount

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status?.length) params.set("status", filters.status.join(","));
    if (filters.remote && filters.remote !== "all")
      params.set("remote", filters.remote);
    if (filters.salaryMin)
      params.set("salaryMin", filters.salaryMin.toString());
    if (filters.salaryMax)
      params.set("salaryMax", filters.salaryMax.toString());
    if (filters.dateAdded && filters.dateAdded !== "all")
      params.set("dateAdded", filters.dateAdded);
    if (filters.employmentTypes?.length)
      params.set("employmentTypes", filters.employmentTypes.join(","));
    if (filters.sortBy && filters.sortBy !== "date_desc")
      params.set("sortBy", filters.sortBy);
    if (page > 1) params.set("page", page.toString());
    if (jobIdFromUrl) params.set("jobId", jobIdFromUrl);

    const qs = params.toString();
    router.replace(`/jobs${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters, page, router, jobIdFromUrl]);

  useEffect(() => {
    if (jobIdFromUrl && !detailModalOpen && !selectedJob) {
      const jobFromList = jobs.find((j) => j.id === jobIdFromUrl);
      if (jobFromList) {
        setSelectedJob(jobFromList);
        openDetailModal();
      }
    }
  }, [jobIdFromUrl, jobs, detailModalOpen, selectedJob, openDetailModal]);

  // Handlers
  const handlePageChange = (p: number) => {
    setPage(p);
    clearSelection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAll = () => {
    if (selectedCount === jobs.length) {
      clearSelection();
    } else {
      selectAll(jobs.map((j) => j.id));
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    openDetailModal();
  };

  const handleUpdateJob = (updatedJob: Job) => {
    if (selectedJob?.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
    refetch();
  };

  const handleStatusChange = async (
    job: Job,
    status: "approved" | "rejected",
  ) => {
    setProcessingJobIds((prev) => new Set(prev).add(job.id));
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      notifications.show({
        title: "Success",
        message: `Job ${status} successfully`,
        color: status === "approved" ? "green" : "red",
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to update status",
        color: "red",
      });
    } finally {
      setProcessingJobIds((prev) => {
        const next = new Set(prev);
        next.delete(job.id);
        return next;
      });
    }
  };

  const handleDeleteJob = (job: Job) => {
    modals.openConfirmModal({
      title: "Delete Job",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{job.title}</b> at{" "}
          <b>{job.company}</b>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Job", cancel: "Cancel" },
      confirmProps: { color: "red", radius: 0 },
      cancelProps: { radius: 0 },
      onConfirm: async () => {
        setProcessingJobIds((prev) => new Set(prev).add(job.id));
        try {
          await deleteJobAction(job.id);
          notifications.show({
            title: "Deleted",
            message: "Job has been removed from the database.",
            color: "green",
          });
          refetch();
        } catch (error) {
          notifications.show({
            title: "Error",
            message: "Failed to delete job.",
            color: "red",
          });
        } finally {
          setProcessingJobIds((prev) => {
            const next = new Set(prev);
            next.delete(job.id);
            return next;
          });
        }
      },
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobIds.length === 0) return;

    if (action === "Delete") {
      modals.openConfirmModal({
        title: "Bulk Delete",
        centered: true,
        children: (
          <Text size="sm">
            Are you sure you want to delete <b>{selectedJobIds.length}</b>{" "}
            selected jobs? This action cannot be undone.
          </Text>
        ),
        labels: { confirm: "Delete All", cancel: "Cancel" },
        confirmProps: { color: "red", radius: 0 },
        cancelProps: { radius: 0 },
        onConfirm: async () => {
          setIsProcessingDeleted(true);
          try {
            await deleteJobsBulkAction(selectedJobIds);
            notifications.show({
              title: "Bulk Deleted",
              message: `${selectedJobIds.length} jobs have been removed.`,
              color: "green",
            });
            clearSelection();
            refetch();
          } catch (error) {
            notifications.show({
              title: "Error",
              message: "Failed to perform bulk delete.",
              color: "red",
            });
          } finally {
            setIsProcessingDeleted(false);
          }
        },
      });
      return;
    }

    if (action === "Approve" || action === "Reject") {
      const status = action === "Approve" ? "approved" : "rejected";
      const setLoader =
        action === "Approve"
          ? setIsProcessingApproved
          : setIsProcessingRejected;
      setLoader(true);
      try {
        await updateJobsStatusBulkAction(selectedJobIds, status);
        notifications.show({
          title: "Bulk Update Success",
          message: `${selectedJobIds.length} jobs marked as ${status}.`,
          color: "green",
        });
        clearSelection();
        refetch();
      } catch (error) {
        notifications.show({
          title: "Error",
          message: `Failed to ${action.toLowerCase()} jobs.`,
          color: "red",
        });
      } finally {
        setLoader(false);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Stack gap="lg" pb={80}>
      <PageHeader
        title="Jobs"
        description="Manage and curate your job database"
        icon={<Briefcase size={24} color="white" />}
        rightSection={
          <Button
            leftSection={<IconSearch size={16} />}
            color="indigo"
            onClick={() => setFetchModalOpen(true)}
            className="mobile-full-width"
          >
            Fetch Jobs
          </Button>
        }
      />

      {/* Main Content */}
      <Stack gap="md" style={{ flex: 1 }}>
        {/* Toolbar */}
        <Card
          withBorder
          p="sm"
          radius={0}
          style={{
            borderWidth: "2px",
            borderColor: "var(--mantine-color-default-border)",
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Popover
                position="bottom-start"
                shadow="md"
                withArrow={false}
                radius={0}
                width={320}
              >
                <Popover.Target>
                  <Indicator
                    label={activeFilterCount > 0 ? activeFilterCount : null}
                    size={16}
                    color="indigo"
                    offset={2}
                    disabled={activeFilterCount === 0}
                    radius={0}
                  >
                    <Button
                      variant="default"
                      leftSection={<IconFilter size={16} />}
                      radius={0}
                      size="sm"
                    >
                      Filters
                    </Button>
                  </Indicator>
                </Popover.Target>
                <Popover.Dropdown
                  p={0}
                  style={{ border: "none", overflow: "hidden" }}
                >
                  <JobFilters
                    filters={filters}
                    onChange={(f) => {
                      setFilters(f);
                      setPage(1);
                    }}
                    withPaper={false}
                  />
                </Popover.Dropdown>
              </Popover>

              <Text size="sm" fw={500} visibleFrom="sm">
                Showing{" "}
                {totalCount > 0
                  ? Math.min((page - 1) * pageSize + 1, totalCount)
                  : 0}
                -{Math.min(page * pageSize, totalCount)} of {totalCount} jobs
              </Text>
            </Group>

            <Text size="xs" fw={700} tt="uppercase" c="dimmed" hiddenFrom="sm">
              {totalCount} total jobs
            </Text>
          </Group>
        </Card>

        {/* Desktop Table */}
        <Box visibleFrom="sm">
          <JobsTable
            jobs={jobs}
            loading={loading}
            selectedJobIds={selectedJobIds}
            onToggleSelection={toggleJobSelection}
            onSelectAll={handleSelectAll}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteJob}
            onStatusChange={handleStatusChange}
            processingJobIds={processingJobIds}
          />
        </Box>

        {/* Mobile List */}
        <Box hiddenFrom="sm">
          <JobsGrid
            jobs={jobs}
            loading={loading}
            selectedJobIds={selectedJobIds}
            onToggleSelection={toggleJobSelection}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteJob}
            onStatusChange={handleStatusChange}
            processingJobIds={processingJobIds}
          />
        </Box>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={handlePageChange}
            />
          </Group>
        )}
      </Stack>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        totalCount={jobs.length}
        onClearSelection={clearSelection}
        onSelectAll={handleSelectAll}
        onApproveSelected={() => handleBulkAction("Approve")}
        onRejectSelected={() => handleBulkAction("Reject")}
        onDeleteSelected={() => handleBulkAction("Delete")}
        isProcessingApproved={isProcessingApproved}
        isProcessingRejected={isProcessingRejected}
        isProcessingDeleted={isProcessingDeleted}
      />

      {/* Fetch Modal */}
      <JobFetchModal
        opened={fetchModalOpen}
        onClose={() => {
          setFetchModalOpen(false);
          if (!loading) refetch();
        }}
      />

      {/* Job Detail Modal */}
      <JobDetailModal
        opened={detailModalOpen}
        onClose={closeDetailModal}
        job={selectedJob}
        onUpdate={handleUpdateJob}
        onDelete={handleDeleteJob}
      />
    </Stack>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <Center h="50vh">
          <Text>Loading jobs...</Text>
        </Center>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
