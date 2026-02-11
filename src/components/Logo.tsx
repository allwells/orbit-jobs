import { Text } from "@mantine/core";

export function Logo({ size }: { size?: string }) {
  return (
    <Text
      fz={size || "h2"}
      fw={400}
      variant="gradient"
      gradient={{ from: "#6366F1", to: "#4F46E5", deg: 135 }}
      style={{ letterSpacing: "-0.5px" }}
    >
      Orbit<span style={{ fontWeight: 800 }}>Jobs</span>
    </Text>
  );
}
