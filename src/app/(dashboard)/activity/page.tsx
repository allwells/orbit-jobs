"use client";

import { useState } from "react";
import { Stack, Container } from "@mantine/core";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/Shared/PageHeader";
import { ActivityList } from "@/components/ActivityFeed/ActivityList";
import { ActivityFilters } from "@/components/ActivityFeed/ActivityFilters";

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  return (
    <Container fluid style={{ maxWidth: 1920 }} p={0} w="100%" h="100%">
      <Stack gap="lg" h="100%">
        <PageHeader
          title="Activity Log"
          description="Audit log of all system actions"
          icon={<Activity size={24} color="white" />}
          rightSection={
            <ActivityFilters
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />
          }
        />

        <ActivityList filter={typeFilter} />
      </Stack>
    </Container>
  );
}
