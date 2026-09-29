import { forwardRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const SheetCloseButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    ariaLabel: string;
    className?: string;
  }
>(function SheetCloseButton({ onClick, ariaLabel, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary-700 text-white shadow-[0_3px_12px_rgb(15_15_18/18%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700",
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <X size={17} aria-hidden="true" />
    </button>
  );
});
