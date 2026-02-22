import { useState, useEffect } from "react";

type ViewMode = "table" | "grid";

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    // Load preference from localStorage on mount
    const saved = localStorage.getItem("orbitjobs-view-mode");
    if (saved === "table" || saved === "grid") {
      // eslint-disable-next-line
      setViewMode(saved);
    }
  }, []);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("orbitjobs-view-mode", mode);
  };

  return {
    viewMode,
    setViewMode: updateViewMode,
  };
}
