import { Outfit } from "next/font/google";
import { Text, TextProps, useMantineTheme } from "@mantine/core";

const font = Outfit({ subsets: ["latin"] });

interface LogoProps extends TextProps {
  size?: string;
}

export function Logo({ size = "xl", style, ...props }: LogoProps) {
  const theme = useMantineTheme();

  return (
    <Text
      component="span"
      size={size}
      fw={400}
      style={{
        color: theme.other.text.primary,
        fontFamily: font.style.fontFamily,
        letterSpacing: "-0.02em",
        ...style,
      }}
      {...props}
    >
      Orbit
      <Text span inherit fw={700} style={{ color: theme.colors.brand[5] }}>
        JOBS
      </Text>
    </Text>
  );
}
