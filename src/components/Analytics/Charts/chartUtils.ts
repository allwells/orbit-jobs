import type {
  TooltipCallbacks,
  TooltipItem,
  TooltipModel,
  TooltipOptions,
} from "chart.js";
import { useMantineTheme } from "@mantine/core";

export const getBrutalistTooltip = (): Partial<TooltipOptions<any>> => {
  const theme = useMantineTheme();

  return {
    backgroundColor: theme.other.background.secondary,
    titleColor: theme.other.text.primary,
    bodyColor: theme.other.text.secondary,
    borderColor: theme.other.border.sidebar,
    borderWidth: 2,
    cornerRadius: 0,
    padding: 12,
    titleFont: {
      family: "JetBrains Mono",
      size: 13,
      weight: "bold" as const,
    },
    bodyFont: {
      family: "JetBrains Mono",
      size: 12,
    },
    displayColors: false,
    boxWidth: 10,
    boxHeight: 10,
    boxPadding: 8,
    usePointStyle: true,
    titleSpacing: 8,
    bodySpacing: 6,
    caretSize: 0,
    callbacks: {
      title: (items: any) => items[0].label.toUpperCase(),
    } as TooltipCallbacks<any, TooltipModel<any>, TooltipItem<any>>,
  };
};
