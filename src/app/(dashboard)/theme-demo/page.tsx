"use client";

import {
  Title,
  Text,
  Container,
  SimpleGrid,
  Card,
  Button,
  Group,
  Stack,
  Badge,
  TextInput,
  Select,
  Table,
  Modal,
  Tooltip,
  Skeleton,
  Divider,
  Alert,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Check as IconCheck,
  AlertCircle as IconAlert,
  Info as IconInfo,
  AlertTriangle as IconWarning,
  Search as IconSearch,
} from "lucide-react";

export default function ThemeDemoPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={2}>Theme System Demo</Title>
          <Badge size="lg" variant="dot">
            v1.0.0
          </Badge>
        </Group>

        <Text size="lg" c="dimmed">
          This page demonstrates the implementation of the theme system across
          various components. Toggle the theme to see how components adapt.
        </Text>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Colors & Tokens */}
          <Card withBorder padding="lg" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Text fw={500}>System Colors</Text>
                <Badge variant="light">Core</Badge>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Group grow>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.other.background.page,
                      border: `1px solid ${theme.other.border.default}`,
                    }}
                  />
                  <Text size="xs">Page</Text>
                </Stack>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.other.background.primary,
                      border: `1px solid ${theme.other.border.default}`,
                    }}
                  />
                  <Text size="xs">Primary</Text>
                </Stack>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.other.background.secondary,
                      border: `1px solid ${theme.other.border.default}`,
                    }}
                  />
                  <Text size="xs">Secondary</Text>
                </Stack>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.other.background.tertiary,
                      border: `1px solid ${theme.other.border.default}`,
                    }}
                  />
                  <Text size="xs">Tertiary</Text>
                </Stack>
              </Group>

              <Divider label="Brand Colors" />

              <Group grow>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.colors.brand[5],
                    }}
                  />
                  <Text size="xs">Primary</Text>
                </Stack>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.colors.brand[6],
                    }}
                  />
                  <Text size="xs">Hover</Text>
                </Stack>
                <Stack gap={4} align="center">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: theme.colors.brand[4],
                    }}
                  />
                  <Text size="xs">Light</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>

          {/* Semantic Alerts */}
          <Card withBorder padding="lg" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Semantic States</Text>
            </Card.Section>
            <Stack gap="sm" mt="md">
              <Alert
                variant="light"
                color="green"
                title="Success"
                icon={<IconCheck size={16} />}
              >
                Operation completed successfully.
              </Alert>
              <Alert
                variant="light"
                color="blue"
                title="Info"
                icon={<IconInfo size={16} />}
              >
                This is an informational message.
              </Alert>
              <Alert
                variant="light"
                color="yellow"
                title="Warning"
                icon={<IconWarning size={16} />}
              >
                Please check your inputs carefully.
              </Alert>
              <Alert
                variant="light"
                color="red"
                title="Error"
                icon={<IconAlert size={16} />}
              >
                Something went wrong.
              </Alert>
            </Stack>
          </Card>

          {/* Buttons & Inputs */}
          <Card withBorder padding="lg" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Inputs & Buttons</Text>
            </Card.Section>
            <Stack gap="md" mt="md">
              <TextInput
                label="Text Input"
                placeholder="Type something..."
                leftSection={<IconSearch size={16} />}
              />
              <Select
                label="Select Input"
                placeholder="Pick one"
                data={["Option 1", "Option 2", "Option 3"]}
              />
              <Group>
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="light">Light</Button>
                <Button variant="subtle">Subtle</Button>
              </Group>
              <Group>
                <Button color="red" variant="light">
                  Destructive
                </Button>
                <Button disabled>Disabled</Button>
              </Group>
            </Stack>
          </Card>

          {/* Data Display */}
          <Card withBorder padding="lg" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Data Display</Text>
            </Card.Section>
            <Stack gap="md" mt="md">
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Role</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>John Doe</Table.Td>
                    <Table.Td>
                      <Badge color="green">Active</Badge>
                    </Table.Td>
                    <Table.Td>Admin</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Jane Smith</Table.Td>
                    <Table.Td>
                      <Badge color="yellow">Pending</Badge>
                    </Table.Td>
                    <Table.Td>User</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Bob Johnson</Table.Td>
                    <Table.Td>
                      <Badge color="red">Offline</Badge>
                    </Table.Td>
                    <Table.Td>Editor</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>

              <Group>
                <Tooltip label="Tooltip content">
                  <Button variant="default" size="xs">
                    Hover me
                  </Button>
                </Tooltip>
                <Badge variant="outline">Outline Badge</Badge>
                <Skeleton height={20} width={100} />
              </Group>
            </Stack>
          </Card>

          {/* Overlays */}
          <Card withBorder padding="lg" radius="md">
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={500}>Overlays</Text>
            </Card.Section>
            <Stack gap="md" mt="md" align="flex-start">
              <Button onClick={open}>Open Modal</Button>
              <Modal
                opened={opened}
                onClose={close}
                title="Example Modal"
                centered
              >
                <Text>
                  This modal uses the theme&apos;s modal background and border
                  tokens.
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={close}>
                    Cancel
                  </Button>
                  <Button onClick={close}>Confirm</Button>
                </Group>
              </Modal>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
