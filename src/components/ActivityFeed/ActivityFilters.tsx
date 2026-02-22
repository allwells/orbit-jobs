"use client";

import { Select, Group, useMantineTheme } from "@mantine/core";

interface ActivityFiltersProps {
  typeFilter: string | null;
  setTypeFilter: (value: string | null) => void;
}

export function ActivityFilters({
  typeFilter,
  setTypeFilter,
}: ActivityFiltersProps) {
  const theme = useMantineTheme();

  return (
    <Group>
      <Select
        placeholder="Filter by Type"
        data={[
          { value: "all", label: "All Activities" },
          { value: "login", label: "Login" },
          { value: "job_fetch", label: "Job Fetch" },
          { value: "job_status", label: "Job Status Change" },
          { value: "api_error", label: "Errors" },
        ]}
        value={typeFilter || "all"}
        onChange={(value) => setTypeFilter(value === "all" ? null : value)}
        allowDeselect={false}
        w={200}
      />
    </Group>
  );
}
