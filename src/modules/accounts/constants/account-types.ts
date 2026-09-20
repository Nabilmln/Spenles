export const ACCOUNT_TYPE_VALUES = [
  "cash",
  "bank",
  "e_wallet",
  "savings",
  "other",
] as const;

export type AccountType = (typeof ACCOUNT_TYPE_VALUES)[number];

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "e_wallet", label: "E-wallet" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
];

export function accountTypeLabel(value: string) {
  return ACCOUNT_TYPES.find((type) => type.value === value)?.label ?? "Other";
}