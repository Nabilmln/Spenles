export const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "e_wallet", label: "E-wallet" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
] as const;

export function accountTypeLabel(value: string) {
  return ACCOUNT_TYPES.find((type) => type.value === value)?.label ?? "Other";
}
