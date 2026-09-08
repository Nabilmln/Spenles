import {
  CirclePlus,
  FileBarChart,
  ListTree,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type PageService = {
  kind: "page";
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SheetService = {
  kind: "sheet";
  id: "add-expense" | "profile";
  label: string;
  icon: LucideIcon;
};

export type ServiceItem = PageService | SheetService;

export const DASHBOARD_SERVICES: PageService[] = [
  { kind: "page", href: "/accounts", label: "Accounts", icon: WalletCards },
  { kind: "page", href: "/split-bills", label: "Split Bill", icon: UsersRound },
  { kind: "page", href: "/categories", label: "Categories", icon: ListTree },
  { kind: "page", href: "/reports", label: "Reports", icon: FileBarChart },
];

export const SERVICES_SHEET_ITEMS: ServiceItem[] = [
  { kind: "sheet", id: "add-expense", label: "Add Expense", icon: CirclePlus },
  { kind: "page", href: "/accounts", label: "Accounts", icon: WalletCards },
  { kind: "page", href: "/categories", label: "Categories", icon: ListTree },
  { kind: "sheet", id: "profile", label: "Profile", icon: UserRound },
  { kind: "page", href: "/reports", label: "Reports", icon: FileBarChart },
  { kind: "page", href: "/split-bills", label: "Split Bill", icon: UsersRound },
];
