import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Car,
  Circle,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";

export const CATEGORY_ICON_LIBRARY: Record<string, LucideIcon> = {
  circle: Circle,
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  home: Home,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "gamepad-2": Gamepad2,
  users: Users,
  gift: Gift,
  plane: Plane,
  wallet: Wallet,
  "briefcase-business": BriefcaseBusiness,
  "trending-up": TrendingUp,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICON_LIBRARY);

export function resolveCategoryIcon(
  id: string,
  name: string,
  icon: string | null,
): LucideIcon {
  if (icon) return CATEGORY_ICON_LIBRARY[icon] ?? Circle;
  return CATEGORY_ICON_LIBRARY[
    CATEGORY_ICON_NAMES[stableCategoryHash(id, name) % CATEGORY_ICON_NAMES.length]
  ] ?? Circle;
}

/**
 * Deterministic, stable hash so a category without an explicit icon always
 * resolves to the same fallback icon across renders.
 */
export function stableCategoryHash(id: string, name: string) {
  const input = `${id}:${name.toLocaleLowerCase("id-ID")}`;
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Indonesian labels used for icon picker accessibility. */
export const CATEGORY_ICON_LABELS: Record<string, string> = {
  circle: "Ikon lingkaran",
  utensils: "Ikon peralatan makan",
  car: "Ikon mobil",
  "shopping-bag": "Ikon tas belanja",
  receipt: "Ikon struk",
  home: "Ikon rumah",
  "heart-pulse": "Ikon kesehatan",
  "graduation-cap": "Ikon pendidikan",
  "gamepad-2": "Ikon hiburan",
  users: "Ikon keluarga",
  gift: "Ikon hadiah",
  plane: "Ikon pesawat",
  wallet: "Ikon dompet",
  "briefcase-business": "Ikon bisnis",
  "trending-up": "Ikon pertumbuhan",
};
