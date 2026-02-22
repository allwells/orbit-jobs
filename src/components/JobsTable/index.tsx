import { Table, Checkbox, Text, Center } from "@mantine/core";
import { JobTableRow } from "./JobTableRow";
import { JobsTableSkeleton } from "./Skeleton";
import type { Job } from "@/types/job";

interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  selectedJobIds: string[];
  onToggleSelection: (jobId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (job: Job, status: "approved" | "rejected") => void;
  processingJobIds?: Set<string>;
}

export function JobsTable({
  jobs,
  loading,
  selectedJobIds,
  onToggleSelection,
  onSelectAll,
  onViewDetails,
  onDelete,
  onStatusChange,
  processingJobIds,
}: JobsTableProps) {
  const allSelected = jobs.length > 0 && selectedJobIds.length === jobs.length;
  const indeterminate =
    selectedJobIds.length > 0 && selectedJobIds.length < jobs.length;

  if (loading) {
    return <JobsTableSkeleton />;
  }

  if (jobs.length === 0) {
    return (
      <Center p="xl">
        <Text c="dimmed">No jobs found matching your filters.</Text>
      </Center>
    );
  }

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table
        verticalSpacing="sm"
        highlightOnHover
        styles={(theme) => ({
          tr: {
            transition: "background-color 0.1s ease",
            "&[data-hover]:hover": {
              backgroundColor: `${theme.other.background.secondary} !important`,
            },
          },
        })}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={onSelectAll}
              />
            </Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th w={200}>Salary</Table.Th>
            <Table.Th w={120}>Remote</Table.Th>
            <Table.Th w={120}>Status</Table.Th>
            <Table.Th w={50} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {jobs.map((job) => (
            <JobTableRow
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
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
