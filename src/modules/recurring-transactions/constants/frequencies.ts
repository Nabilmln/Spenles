export const RECURRING_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export function recurringFrequencyLabel(value: string) {
  return (
    RECURRING_FREQUENCIES.find((frequency) => frequency.value === value)?.label ??
    value
  );
}
