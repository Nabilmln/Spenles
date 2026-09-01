import {
  FileBarChart,
  ListTree,
  ReceiptText,
  Repeat2,
  Target,
  UserRound,
  UsersRound,
  WalletCards,
  CirclePlus,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ALL_SERVICES: Service[] = [
  { href: "/transactions/new", label: "Add Expense", icon: CirclePlus },
  { href: "/accounts", label: "Accounts", icon: WalletCards },
  { href: "/split-bills", label: "Split Bill", icon: UsersRound },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/categories", label: "Categories", icon: ListTree },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/recurring-transactions", label: "Recurring", icon: Repeat2 },
  { href: "/settings/profile", label: "Profile", icon: UserRound },
];

export const QUICK_SERVICES = ALL_SERVICES.slice(0, 4);