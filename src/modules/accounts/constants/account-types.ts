export const ACCOUNT_TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Rekening bank" },
  { value: "e_wallet", label: "Dompet digital" },
  { value: "savings", label: "Tabungan" },
  { value: "other", label: "Lainnya" },
] as const;

export function accountTypeLabel(value: string) {
  return ACCOUNT_TYPES.find((type) => type.value === value)?.label ?? "Lainnya";
}
