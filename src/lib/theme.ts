import { MantineThemeOverride, MantineTheme } from "@mantine/core";

export const getTheme = (
  colorScheme: "light" | "dark",
): MantineThemeOverride => ({
  primaryColor: "brand",
  colors: {
    brand: [
      "#EEEEFF", // 0
      "#DCDCFF", // 1
      "#BDBDFF", // 2
      "#9D9DFF", // 3
      "#8184F4", // 4 (brand.light)
      "#6366F1", // 5 (brand.primary) - DEFAULT
      "#5558E3", // 6 (brand.hover)
      "#4245D5", // 7 (brand.active)
      "#3033C0", // 8
      "#2022A0", // 9
    ],
  },
  other: {
    background: {
      page: colorScheme === "dark" ? "#0A0A0A" : "#F5F5F5",
      primary: colorScheme === "dark" ? "#101010" : "#EFEFEF",
      secondary: colorScheme === "dark" ? "#1A1A1A" : "#E5E5E5",
      tertiary: colorScheme === "dark" ? "#242424" : "#DBDBDB",
      modal: colorScheme === "dark" ? "#1A1A1A" : "#E5E5E5",
      dropdown: colorScheme === "dark" ? "#1A1A1A" : "#E5E5E5",
      input: colorScheme === "dark" ? "#1F1F1F" : "#E0E0E0",
      hover: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      active: colorScheme === "dark" ? "#333333" : "#CCCCCC",
      skeleton: colorScheme === "dark" ? "#1F1F1F" : "#E0E0E0",
      tooltip: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      badge: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
    },
    border: {
      default: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      subtle: colorScheme === "dark" ? "#1F1F1F" : "#E0E0E0",
      strong: colorScheme === "dark" ? "#3A3A3A" : "#C5C5C5",
      input: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      inputHover: colorScheme === "dark" ? "#3A3A3A" : "#C5C5C5",
      inputFocus: "#6366F1",
      sidebar: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      modal: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
      dropdown: colorScheme === "dark" ? "#2A2A2A" : "#D5D5D5",
    },
    text: {
      primary: colorScheme === "dark" ? "#FFFFFF" : "#0A0A0A",
      secondary: colorScheme === "dark" ? "#A0A0A0" : "#5F5F5F",
      tertiary: colorScheme === "dark" ? "#707070" : "#8F8F8F",
      muted: colorScheme === "dark" ? "#505050" : "#AFAFAF",
      inverse: colorScheme === "dark" ? "#0A0A0A" : "#FFFFFF",
      link: "#6366F1",
      linkHover: colorScheme === "dark" ? "#8184F4" : "#4F52D9",
    },
    brand: {
      primary: "#6366F1",
      hover: "#5558E3",
      active: "#4245D5",
      light: "#8184F4",
      subtle: "rgba(99, 102, 241, 0.1)",
    },
    success: {
      text: colorScheme === "dark" ? "#10B981" : "#059669",
      background:
        colorScheme === "dark"
          ? "rgba(16, 185, 129, 0.1)"
          : "rgba(5, 150, 105, 0.1)",
      border:
        colorScheme === "dark"
          ? "rgba(16, 185, 129, 0.3)"
          : "rgba(5, 150, 105, 0.3)",
    },
    error: {
      text: colorScheme === "dark" ? "#EF4444" : "#DC2626",
      background:
        colorScheme === "dark"
          ? "rgba(239, 68, 68, 0.1)"
          : "rgba(220, 38, 38, 0.1)",
      border:
        colorScheme === "dark"
          ? "rgba(239, 68, 68, 0.3)"
          : "rgba(220, 38, 38, 0.3)",
    },
    warning: {
      text: colorScheme === "dark" ? "#F59E0B" : "#D97706",
      background:
        colorScheme === "dark"
          ? "rgba(245, 158, 11, 0.1)"
          : "rgba(217, 119, 6, 0.1)",
      border:
        colorScheme === "dark"
          ? "rgba(245, 158, 11, 0.3)"
          : "rgba(217, 119, 6, 0.3)",
    },
    info: {
      text: colorScheme === "dark" ? "#3B82F6" : "#2563EB",
      background:
        colorScheme === "dark"
          ? "rgba(59, 130, 246, 0.1)"
          : "rgba(37, 99, 235, 0.1)",
      border:
        colorScheme === "dark"
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(37, 99, 235, 0.3)",
    },
    shadow: {
      sm:
        colorScheme === "dark"
          ? "0 1px 2px 0 rgba(0, 0, 0, 0.5)"
          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md:
        colorScheme === "dark"
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.5)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg:
        colorScheme === "dark"
          ? "0 10px 15px -3px rgba(0, 0, 0, 0.6)"
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      xl:
        colorScheme === "dark"
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.7)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    fonts: {
      display: "var(--font-jetbrains-mono), monospace",
      accent: "var(--font-space-grotesk), sans-serif",
    },
    gradients: {
      brandSubtle:
        "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 100%)",
      brandBold: "linear-gradient(135deg, #6366F1 0%, #8184F4 100%)",
      dataViz: "linear-gradient(90deg, #10B981 0%, #6366F1 100%)",
    },
  },
  defaultRadius: 0,
  components: {
    Card: {
      defaultProps: {
        radius: 0,
        withBorder: true,
      },
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.sidebar}`,
        },
      }),
    },
    Paper: {
      defaultProps: {
        p: "md",
        radius: 0,
        withBorder: true,
      },
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.sidebar}`,
        },
      }),
    },
    Text: {
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.other.text.primary,
          fontFamily: "var(--font-jetbrains-mono)",
        },
      }),
    },
    Title: {
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.other.text.primary,
          fontFamily: "var(--font-jetbrains-mono)",
        },
      }),
    },
    Button: {
      defaultProps: {
        radius: 0,
        fw: 700,
        tt: "uppercase",
      },
      styles: {
        root: {
          fontFamily: "var(--font-jetbrains-mono)",
          borderWidth: "2px",
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 0,
        tt: "uppercase",
        fw: 700,
      },
      styles: {
        root: {
          border: "1px solid",
          fontFamily: "var(--font-jetbrains-mono)",
          padding: "0.2rem 0.3rem",
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          borderWidth: "2px",
          borderColor: theme.other.border.input,
          "&:focus": {
            borderColor: theme.other.border.inputFocus,
          },
        },
      }),
    },
    Modal: {
      defaultProps: {
        radius: 0,
        withCloseButton: true,
      },
      styles: (theme: MantineTheme) => ({
        content: {
          paddingTop: 0,
          border: `2px solid ${theme.other.border.sidebar}`,
          backgroundColor: theme.other.background.secondary,
        },
        header: {
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
        },
      }),
    },
    TextInput: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.strong}`,
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
      }),
    },
    PasswordInput: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.strong}`,
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
      }),
    },
    NumberInput: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.strong}`,
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
      }),
    },
    Select: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.strong}`,
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
        dropdown: {
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.strong}`,
        },
        option: {
          color: theme.other.text.secondary,
          backgroundColor: theme.other.background.secondary,
          "&:hover": {
            color: theme.other.text.primary,
            backgroundColor: theme.other.background.hover,
          },
        },
      }),
    },
    MultiSelect: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        input: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.strong}`,
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
        dropdown: {
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.strong}`,
        },
        option: {
          color: theme.other.text.secondary,
          backgroundColor: theme.other.background.secondary,
          "&:hover": {
            color: theme.other.text.primary,
            backgroundColor: theme.other.background.hover,
          },
        },
      }),
    },
    Menu: {
      defaultProps: {
        radius: 0,
        withArrow: false,
        offset: 2,
      },
      styles: (theme: MantineTheme) => ({
        root: {
          border: "none",
        },
        dropdown: {
          backgroundColor: theme.other.background.secondary,
          border: `2px solid ${theme.other.border.sidebar}`,
        },
        divider: {
          border: `1px solid ${theme.other.border.sidebar}`,
        },
        item: {
          fontFamily: "var(--font-jetbrains-mono)",
          color: theme.other.text.primary,
        },
      }),
    },
    Drawer: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        content: {
          borderLeft: `2px solid ${theme.other.border.default}`,
        },
        header: {
          borderBottom: `2px solid ${theme.other.border.subtle}`,
        },
        title: {
          fontFamily: "var(--font-jetbrains-mono)",
          fontWeight: 700,
          textTransform: "uppercase",
        },
      }),
    },
    ThemeIcon: {
      defaultProps: {
        radius: 0,
      },
    },
    Avatar: {
      defaultProps: {
        radius: 0,
      },
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.other.text.primary,
          backgroundColor: "transparent",
          border: `2px solid ${theme.other.border.sidebar}`,
        },
      }),
    },
    Table: {
      styles: (theme: MantineTheme) => ({
        th: {
          fontFamily: "var(--font-jetbrains-mono)",
          color: theme.other.text.primary,
          border: `2px solid ${theme.other.border.sidebar}`,
        },
        td: {
          fontFamily: "var(--font-jetbrains-mono)",
          border: `2px solid ${theme.other.border.sidebar}`,
        },
      }),
    },
    Tabs: {
      styles: (theme: MantineTheme) => ({
        root: {
          border: "none",
        },
        list: {
          // borderBottom: `2px solid ${theme.other.border.sidebar}`,
          border: "none",
        },
        tab: {
          fontFamily: "var(--font-jetbrains-mono)",
          color: theme.other.text.primary,
          border: "none",
        },
        tabActive: {
          border: "none",
          color: theme.other.text.primary,
          backgroundColor: theme.other.background.secondary,
        },
      }),
    },
  },
});
