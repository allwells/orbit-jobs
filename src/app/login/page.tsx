"use client";

import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Container,
  Stack,
  Box,
  Notification,
  rem,
} from "@mantine/core";
import { useState } from "react";
import { Lock, User, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.username(
        {
          username,
          password,
        },
        {
          onSuccess: () => {
            // Force a hard navigation to ensure session cookies are properly
            // recognized by the server middleware and to clear client state.
            window.location.href = "/";
          },
          onError: (ctx) => {
            setError(
              ctx.error.message || "Invalid credentials. Access denied.",
            );
            setLoading(false);
          },
        },
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "radial-gradient(circle at center, #151515 0%, #0A0A0A 100%)",
      }}
    >
      <Container size={520} my={40}>
        <Stack gap={4} align="center" mb={24}>
          <Text
            fw={900}
            fz="h2"
            variant="gradient"
            gradient={{ from: "#6366F1", to: "#4F46E5", deg: 135 }}
            style={{ letterSpacing: "-0.5px" }}
          >
            OrbitJobs
          </Text>
        </Stack>

        <form onSubmit={handleLogin}>
          <Stack gap="xs">
            {error && (
              <Notification
                icon={
                  <AlertCircle style={{ width: rem(18), height: rem(18) }} />
                }
                color="red"
                title="Access Denied"
                onClose={() => setError(null)}
                withCloseButton
                radius="md"
              >
                {error}
              </Notification>
            )}

            <TextInput
              placeholder="Username"
              required
              size="md"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              leftSection={<User size={18} opacity={0.5} />}
              variant="filled"
              styles={{
                input: {
                  backgroundColor: "#1A1A1A",
                  color: "white",
                  "&:focus": {
                    borderColor: "#6366F1",
                  },
                },
              }}
            />
            <PasswordInput
              placeholder="Password"
              required
              size="md"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              leftSection={<Lock size={18} opacity={0.5} />}
              variant="filled"
              styles={{
                input: {
                  backgroundColor: "#1A1A1A",
                  color: "white",
                  "&:focus": {
                    borderColor: "#6366F1",
                  },
                },
              }}
            />

            <Button
              fullWidth
              mt="xs"
              size="md"
              color="indigo"
              type="submit"
              loading={loading}
              radius="md"
              styles={{
                root: {
                  background:
                    "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                  transition: "transform 0.1s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5850EC 0%, #4338CA 100%)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                },
              }}
            >
              Login
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="xl" size="xs" c="dimmed">
          Restricted access system. Unauthorized attempts are logged.
        </Text>
      </Container>
    </Box>
  );
}
