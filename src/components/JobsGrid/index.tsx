import { Stack, Center, Loader, Text } from "@mantine/core";
import { JobMobileCard } from "./JobMobileCard";
import type { Job } from "@/types/job";

interface JobsGridProps {
  jobs: Job[];
  loading: boolean;
  selectedJobIds: string[];
  onToggleSelection: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (job: Job, status: "approved" | "rejected") => void;
  processingJobIds?: Set<string>;
}

export function JobsGrid({
  jobs,
  loading,
  selectedJobIds,
  onToggleSelection,
  onViewDetails,
  onDelete,
  onStatusChange,
  processingJobIds,
}: JobsGridProps) {
  if (loading) {
    return (
      <Center p="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (jobs.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed">No jobs found matching your filters.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {jobs.map((job) => (
        <JobMobileCard
          key={job.id}
          job={job}
          isSelected={selectedJobIds.includes(job.id)}
          onToggleSelection={() => onToggleSelection(job.id)}
          onViewDetails={onViewDetails}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isProcessing={processingJobIds?.has(job.id)}
        />
      ))}
    </Stack>
  );
}
