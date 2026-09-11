"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SingleDateCalendar } from "@/components/ui/single-date-calendar";

export function MakeBillDateSheet({
  open,
  onClose,
  value,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onSelect: (date: string) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Select Bill Date"
      ariaLabel="Select bill date"
    >
      <SingleDateCalendar
        value={value}
        onChange={(date) => {
          onSelect(date);
          onClose();
        }}
      />
    </BottomSheet>
  );
}