"use client";

import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Title,
  Container,
  Group,
  Button,
  Box,
  Text,
  Paper,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Lock, User, Terminal } from "lucide-react";
import { notifications } from "@mantine/notifications";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ username, password });

      notifications.show({
        title: "ACCESS GRANTED",
        message: "Welcome back, Commander.",
        color: "green",
        style: { fontFamily: "var(--font-jetbrains-mono)" },
      });
      router.push("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      notifications.show({
        title: "ACCESS DENIED",
        message: err.message || "Invalid credentials",
        color: "red",
        style: { fontFamily: "var(--font-jetbrains-mono)" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {/* Left Panel - Brutalist Branding */}
      <Box
        visibleFrom="sm"
        style={{
          flex: 1,
          backgroundColor: "var(--mantine-color-dark-9)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "var(--mantine-spacing-xl)",
          position: "relative",
          overflow: "hidden",
          borderRight: "2px solid var(--mantine-color-default-border)",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(var(--mantine-color-dark-4) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.2,
            zIndex: 0,
          }}
        />

        <div style={{ zIndex: 1 }}>
          <Group gap="xs" mb="lg">
            <Terminal size={32} />
            <Text
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "1px",
              }}
              fw={700}
            >
              ORBIT_JOBS
            </Text>
          </Group>
        </div>

        <Stack gap="xl" style={{ zIndex: 1, maxWidth: 400 }}>
          <Title
            order={1}
            style={{
              fontSize: "3rem",
              lineHeight: 1,
              fontFamily: "var(--font-space-grotesk)",
              textTransform: "uppercase",
              letterSpacing: "-1px",
            }}
          >
            Mission Control Center
          </Title>
          <Text size="xl" c="dimmed">
            Manage high-value job listings and track system analytics from a
            centralized command post.
          </Text>
        </Stack>

        <div style={{ zIndex: 1 }}>
          <Text
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            c="dimmed"
            size="sm"
          >
            SYSTEM VERSION 2.0.4
          </Text>
        </div>
      </Box>

      {/* Right Panel - Login Form */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--mantine-color-body)",
          padding: "var(--mantine-spacing-xl)",
        }}
      >
        <Container size="xs" w="100%">
          <Paper
            withBorder
            p="xl"
            radius={0}
            style={{
              borderWidth: "2px",
              borderColor: "var(--mantine-color-default-border)",
              boxShadow: "var(--mantine-shadow-xl)",
              position: "relative",
            }}
          >
            <LoadingOverlay
              visible={loading}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />

            <Box mb="xl">
              <Title
                order={2}
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                System Access
              </Title>
            </Box>

            <form onSubmit={handleLogin}>
              <Stack>
                <TextInput
                  label="Username"
                  placeholder="ENTER ID"
                  value={username}
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  leftSection={<User size={16} />}
                  required
                  radius={0}
                  styles={{
                    input: { fontFamily: "var(--font-jetbrains-mono)" },
                    label: {
                      fontFamily: "var(--font-jetbrains-mono)",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    },
                  }}
                />

                <PasswordInput
                  label="Password"
                  placeholder="ENTER PASSCODE"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  leftSection={<Lock size={16} />}
                  required
                  radius={0}
                  styles={{
                    input: { fontFamily: "var(--font-jetbrains-mono)" },
                    label: {
                      fontFamily: "var(--font-jetbrains-mono)",
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    },
                  }}
                />

                <Button
                  fullWidth
                  mt="sm"
                  size="md"
                  type="submit"
                  loading={loading}
                  color="indigo"
                  radius={0}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    border: "2px solid transparent",
                  }}
                >
                  Initiate Session
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </div>
  );
}
