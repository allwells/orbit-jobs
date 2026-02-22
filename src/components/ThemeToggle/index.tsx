"use client";

import { useTheme } from "@/contexts/ThemeContext";
import {
  Group,
  Box,
  UnstyledButton,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mantineTheme = useMantineTheme();

  // Calculate position of the sliding indicator
  const indicatorPosition = {
    system: 4,
    light: 36, // 4px padding + 32px width
    dark: 68, // 4px padding + 32px width + 32px width
  };

  return (
    <Box
      bg="background.tertiary"
      style={{
        padding: "4px",
        border: `2px solid ${mantineTheme.other.border.strong}`,
        display: "inline-flex",
        position: "relative",
        height: "44px",
        width: "107px",
      }}
    >
      {/* Sliding indicator */}
      <Box
        style={{
          position: "absolute",
          top: "4px",
          left: "0",
          width: "32px",
          height: "32px",
          border: `1px solid ${mantineTheme.other.border.sidebar}`,
          backgroundColor: mantineTheme.other.text.primary,
          transform: `translateX(${indicatorPosition[theme]}px)`,
          transition: "transform 200ms ease-in-out",
          zIndex: 1,
        }}
      />

      <Group gap={0} wrap="nowrap" style={{ position: "relative", zIndex: 2 }}>
        <Tooltip label="System" withArrow position="bottom" openDelay={500}>
          <UnstyledButton
            onClick={() => setTheme("system")}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                theme === "system"
                  ? mantineTheme.other.background.page
                  : mantineTheme.other.text.secondary,
              transition: "color 200ms ease",
            }}
          >
            <Monitor size={16} />
          </UnstyledButton>
        </Tooltip>

        <Tooltip label="Light" withArrow position="bottom" openDelay={500}>
          <UnstyledButton
            onClick={() => setTheme("light")}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                theme === "light"
                  ? mantineTheme.other.background.page
                  : mantineTheme.other.text.secondary,
              transition: "color 200ms ease",
            }}
          >
            <Sun size={16} />
          </UnstyledButton>
        </Tooltip>

        <Tooltip label="Dark" withArrow position="bottom" openDelay={500}>
          <UnstyledButton
            onClick={() => setTheme("dark")}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color:
                theme === "dark"
                  ? mantineTheme.other.background.page
                  : mantineTheme.other.text.secondary,
              transition: "color 200ms ease",
            }}
          >
            <Moon size={16} />
          </UnstyledButton>
        </Tooltip>
      </Group>
    </Box>
  );
}
