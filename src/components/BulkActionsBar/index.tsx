import {
  Paper,
  Group,
  Text,
  Button,
  Checkbox,
  Transition,
  Modal,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Check as IconCheck,
  X as IconX,
  Trash as IconTrash,
} from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onApproveSelected: () => void;
  onRejectSelected: () => void;
  onDeleteSelected: () => void;
  isProcessingApproved?: boolean;
  isProcessingRejected?: boolean;
  isProcessingDeleted?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  onApproveSelected,
  onRejectSelected,
  onDeleteSelected,
  isProcessingApproved,
  isProcessingRejected,
  isProcessingDeleted,
}: BulkActionsBarProps) {
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  return (
    <>
      <Transition
        mounted={selectedCount > 0}
        transition="slide-up"
        duration={200}
        timingFunction="ease"
      >
        {(styles) => (
          <Paper
            shadow="lg"
            radius={0}
            p="sm"
            withBorder
            style={{
              ...styles,
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 200,
              borderLeft: "none",
              borderRight: "none",
              borderBottom: "none",
              borderTopWidth: "2px",
            }}
          >
            <Group justify="center" w="100%">
              <Group
                justify="space-between"
                style={{ width: "100%", maxWidth: 1200 }}
                wrap="nowrap"
                gap="md"
              >
                <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <Checkbox
                    checked={selectedCount > 0 && selectedCount === totalCount}
                    indeterminate={
                      selectedCount > 0 && selectedCount < totalCount
                    }
                    onChange={(e) =>
                      e.currentTarget.checked
                        ? onSelectAll()
                        : onClearSelection()
                    }
                  />
                  <Text
                    fw={700}
                    size="sm"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    {selectedCount}{" "}
                    <Box component="span" visibleFrom="xs">
                      SELECTED
                    </Box>
                  </Text>
                  <Button
                    variant="subtle"
                    size="compact-xs"
                    color="gray"
                    onClick={onClearSelection}
                    visibleFrom="sm"
                  >
                    CLEAR
                  </Button>
                </Group>

                <Group
                  gap="xs"
                  wrap="nowrap"
                  style={{ flex: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    leftSection={<IconCheck size={16} />}
                    color="green"
                    size="xs"
                    variant="filled"
                    onClick={onApproveSelected}
                    loading={isProcessingApproved}
                    disabled={isProcessingRejected || isProcessingDeleted}
                    flex={{ base: 1, sm: "initial" }}
                  >
                    APPROVE
                  </Button>
                  <Button
                    leftSection={<IconX size={16} />}
                    color="red"
                    size="xs"
                    variant="filled"
                    onClick={onRejectSelected}
                    loading={isProcessingRejected}
                    disabled={isProcessingApproved || isProcessingDeleted}
                    flex={{ base: 1, sm: "initial" }}
                  >
                    REJECT
                  </Button>
                  <Button
                    color="red"
                    size="xs"
                    variant="outline"
                    onClick={onDeleteSelected}
                    loading={isProcessingDeleted}
                    disabled={isProcessingApproved || isProcessingRejected}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              </Group>
            </Group>
          </Paper>
        )}
      </Transition>
    </>
  );
}
