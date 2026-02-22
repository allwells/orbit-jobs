import { auth } from "@/lib/auth";
import { Settings } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Container, Stack } from "@mantine/core";
import { PageHeader } from "@/components/Shared/PageHeader";
import { getSettingsAction } from "@/app/actions/settings-actions";
import { SettingsForm } from "@/components/Settings/SettingsForm";
import { getDefaultJobFetchConfigAction } from "@/app/actions/settings-utils-actions";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Parallel data fetching
  const [settings, jobFetchConfig] = await Promise.all([
    getSettingsAction(),
    getDefaultJobFetchConfigAction(),
  ]);

  return (
    <Container fluid style={{ maxWidth: 1920 }} py="xl" px={0} w="100%">
      <Stack gap="lg">
        <PageHeader
          title="Settings"
          description="Manage system configuration and preferences"
          icon={<Settings size={24} color="white" />}
        />

        <SettingsForm
          initialSettings={settings}
          initialJobFetchConfig={jobFetchConfig}
          user={{
            id: session.user.id,
            username: session.user.name || session.user.email || "User",
          }}
        />
      </Stack>
    </Container>
  );
}
