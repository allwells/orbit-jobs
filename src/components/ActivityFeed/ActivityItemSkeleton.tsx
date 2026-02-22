import { Skeleton, useMantineTheme } from "@mantine/core";

export function ActivityItemSkeleton() {
  const theme = useMantineTheme();

  return (
    <div
      style={{
        display: "flex",
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      {/* Timeline bullet skeleton */}
      <div style={{ paddingLeft: 4, minWidth: 24 }}>
        <Skeleton height={24} width={24} circle />
      </div>

      {/* Content skeleton */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Skeleton height={14} width="60%" radius={0} />
          <Skeleton height={12} width="20%" radius={0} />
        </div>

        <Skeleton height={12} width="90%" radius={0} mb={8} />
        <Skeleton height={12} width="80%" radius={0} mb={12} />

        <div style={{ display: "flex", gap: 12 }}>
          <Skeleton height={20} width={60} radius={0} />
          <Skeleton height={20} width={70} radius={0} />
        </div>
      </div>
    </div>
  );
}
