import {
  Stack,
  TextInput,
  Select,
  MultiSelect,
  NumberInput,
  Group,
  Button,
  Text,
  Badge,
  ActionIcon,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import {
  Search as IconSearch,
  X as IconX,
  Filter as IconFilter,
} from "lucide-react";
import type { JobFilterParams } from "@/types/job";
import { EMPLOYMENT_TYPES } from "@/components/JobFetchModal/constants";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

interface JobFiltersProps {
  filters: JobFilterParams;
  onChange: (filters: JobFilterParams) => void;
  withPaper?: boolean;
}

export function JobFilters({
  filters,
  onChange,
  withPaper = true,
}: JobFiltersProps) {
  const { stats } = useDashboardStats();
  const theme = useMantineTheme();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: keyof JobFilterParams, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      search: "",
      status: [],
      remote: "all",
      salaryMin: undefined,
      salaryMax: undefined,
      dateAdded: "all",
      employmentTypes: [],
      sortBy: "date_desc",
    });
  };

  const activeFilterCount = [
    filters.search?.trim(),
    filters.status && filters.status.length > 0,
    filters.remote && filters.remote !== "all",
    filters.salaryMin !== undefined && filters.salaryMin !== null,
    filters.salaryMax !== undefined && filters.salaryMax !== null,
    filters.dateAdded && filters.dateAdded !== "all",
    filters.employmentTypes && filters.employmentTypes.length > 0,
  ].filter(Boolean).length;

  return (
    <Stack
      gap="md"
      p="md"
      style={{
        border: "2px solid var(--mantine-color-default-border)",
        backgroundColor: theme.other.background.secondary,
      }}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <IconFilter size={18} />
          <Text fw={700} style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            FILTERS
          </Text>
          {activeFilterCount > 0 && (
            <Badge size="sm" variant="filled" color="indigo" radius={0}>
              {activeFilterCount}
            </Badge>
          )}
        </Group>
        {activeFilterCount > 0 && (
          <Button
            variant="subtle"
            color="red"
            size="compact-xs"
            onClick={clearFilters}
            radius={0}
          >
            RESET
          </Button>
        )}
      </Group>

      <Stack gap="md">
        <TextInput
          placeholder="SEARCH..."
          leftSection={<IconSearch size={16} />}
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.currentTarget.value)}
          radius={0}
          rightSection={
            filters.search ? (
              <ActionIcon
                size="sm"
                variant="transparent"
                c="dimmed"
                onClick={() => updateFilter("search", "")}
                radius={0}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
        />

        <Select
          label="WORK SETTING"
          data={[
            { value: "all", label: "All Settings" },
            { value: "remote", label: "Remote Only" },
            { value: "onsite", label: "On-site" },
          ]}
          value={filters.remote || "all"}
          onChange={(val) => updateFilter("remote", val)}
          allowDeselect={false}
          radius={0}
          labelProps={{
            style: {
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            },
          }}
        />

        <MultiSelect
          label="STATUS"
          placeholder="Select status"
          data={[
            {
              value: "pending",
              label: `Pending (${stats.pendingReview.value})`,
            },
            { value: "approved", label: `Approved (${stats.approved.value})` },
            { value: "rejected", label: `Rejected (${stats.rejected.value})` },
            { value: "posted", label: `Posted (${stats.postedToX.value})` },
          ]}
          value={filters.status || []}
          onChange={(val) => updateFilter("status", val)}
          clearable
          radius={0}
          labelProps={{
            style: {
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            },
          }}
        />

        <MultiSelect
          label="EMPLOYMENT TYPE"
          placeholder="Select types"
          data={EMPLOYMENT_TYPES}
          value={filters.employmentTypes || []}
          onChange={(val) => updateFilter("employmentTypes", val)}
          clearable
          radius={0}
          labelProps={{
            style: {
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            },
          }}
        />

        <Divider
          label="SALARY RANGE"
          labelPosition="center"
          size="sm"
          style={{ label: { fontFamily: "var(--font-jetbrains-mono)" } }}
        />

        <Group gap="xs" wrap="wrap">
          <NumberInput
            placeholder="Min"
            min={0}
            step={1000}
            prefix="$"
            value={filters.salaryMin}
            onChange={(val) => updateFilter("salaryMin", val)}
            allowNegative={false}
            radius={0}
            style={{ flex: 1, minWidth: "120px" }}
          />
          <NumberInput
            placeholder="Max"
            min={0}
            step={1000}
            prefix="$"
            value={filters.salaryMax}
            onChange={(val) => updateFilter("salaryMax", val)}
            allowNegative={false}
            radius={0}
            style={{ flex: 1, minWidth: "120px" }}
          />
        </Group>

        <Select
          label="DATE ADDED"
          data={[
            { value: "all", label: "All Time" },
            { value: "today", label: "Today" },
            { value: "7days", label: "Last 7 Days" },
            { value: "30days", label: "Last 30 Days" },
            { value: "90days", label: "Last 90 Days" },
          ]}
          value={filters.dateAdded || "all"}
          onChange={(val) => updateFilter("dateAdded", val)}
          allowDeselect={false}
          radius={0}
          labelProps={{
            style: {
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            },
          }}
        />

        <Divider size="sm" />

        <Select
          label="SORT BY"
          data={[
            { value: "date_desc", label: "Newest First" },
            { value: "date_asc", label: "Oldest First" },
            { value: "salary_desc", label: "Salary: High to Low" },
            { value: "salary_asc", label: "Salary: Low to High" },
            { value: "company_asc", label: "Company: A-Z" },
            { value: "company_desc", label: "Company: Z-A" },
            { value: "title_asc", label: "Title: A-Z" },
            { value: "title_desc", label: "Title: Z-A" },
          ]}
          value={filters.sortBy || "date_desc"}
          onChange={(val) => updateFilter("sortBy", val)}
          allowDeselect={false}
          radius={0}
          labelProps={{
            style: {
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "12px",
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
