export const RECURRING_FREQUENCIES = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
] as const;

export function recurringFrequencyLabel(value: string) {
  return (
    RECURRING_FREQUENCIES.find((frequency) => frequency.value === value)?.label ??
    value
  );
}
