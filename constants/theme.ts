export const colors = {
  background: "#0A0A0A", // Deep black for the main app background
  foreground: "#FFFFFF", // White text
  card: "#1C1C1E", // Dark gray for the TabBar and Grid/Streak cards
  muted: "#2C2C2E", // Lighter gray for empty grid squares
  mutedForeground: "#8E8E93", // Gray for inactive tab icons and secondary text
  primary: "#FFFFFF", // White (used for the active tab background)
  primaryForeground: "#000000", // Black (used for the icon inside the active tab)
  accent: "#ea7a53", // Kept your original accent
  border: "rgba(255, 255, 255, 0.1)",
  success: "#5EBC67", // The bright green from the progress grid
  destructive: "#E55E5E", // The red from the progress grid
  subscription: "#8fd1bd",
} as const
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const

export const theme = {
  colors,
  spacing,
  components,
} as const
