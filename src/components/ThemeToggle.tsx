"use client";

import {
  useMantineColorScheme,
  SegmentedControl,
  Center,
  Tooltip,
} from "@mantine/core";
import { Sun, Moon, Monitor } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
      data={[
        {
          value: "light",
          label: (
            <Tooltip label="Light" position="top" withArrow>
              <Center>
                <Sun size={16} />
              </Center>
            </Tooltip>
          ),
        },
        {
          value: "dark",
          label: (
            <Tooltip label="Dark" position="top" withArrow>
              <Center>
                <Moon size={16} />
              </Center>
            </Tooltip>
          ),
        },
        {
          value: "auto",
          label: (
            <Tooltip label="System" position="top" withArrow>
              <Center>
                <Monitor size={16} />
              </Center>
            </Tooltip>
          ),
        },
      ]}
      className={styles.toggle}
      size="xs"
    />
  );
}
