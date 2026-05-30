import history from "@/assets/icons/history.png"
import home from "@/assets/icons/home.png"
import profile from "@/assets/icons/profile.png"

export const icons = {
  home,
  profile,
  history,
} as const

export type IconKey = keyof typeof icons
