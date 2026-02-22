import { useState, useCallback } from "react";

export function useJobSelection() {
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());

  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((jobIds: string[]) => {
    setSelectedJobIds(new Set(jobIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedJobIds(new Set());
  }, []);

  const isSelected = useCallback(
    (jobId: string) => selectedJobIds.has(jobId),
    [selectedJobIds],
  );

  return {
    selectedJobIds: Array.from(selectedJobIds),
    selectedCount: selectedJobIds.size,
    toggleJobSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
