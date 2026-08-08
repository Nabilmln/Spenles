export const buttonBase =
  "button inline-flex min-h-[2.85rem] cursor-pointer items-center justify-center gap-[.5rem] rounded-[.72rem] border border-transparent px-4 py-[.65rem] font-medium transition-[background,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55";

export const buttonVariant: Record<string, string> = {
  primary: "bg-primary-600 text-white hover:enabled:bg-primary-700",
  secondary: "border-border bg-surface text-foreground",
  ghost: "bg-transparent text-foreground",
  danger: "bg-expense text-white",
};

export function buttonClass(
  variant: keyof typeof buttonVariant = "primary",
  className?: string,
): string {
  return className ? `${buttonBase} ${buttonVariant[variant]} ${className}` : `${buttonBase} ${buttonVariant[variant]}`;
}

export const cardClass =
  "card rounded-2xl border border-border bg-surface p-[1.35rem] shadow-card";

export const inputClass =
  "w-full min-h-[2.9rem] rounded-[.72rem] border border-border bg-surface-subtle px-[.85rem] py-[.72rem] text-foreground transition-[border,box-shadow] duration-150 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(59_130_246/12%)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65";

export const inputDisplayClass =
  "flex min-h-[2.9rem] items-center rounded-[.72rem] border border-border bg-surface-subtle px-[.85rem] py-[.72rem] text-[.92rem] font-medium text-muted";

export const formMessageClass = "m-0 text-[.82rem] text-expense";

export const successMessageClass =
  "m-0 rounded-[.7rem] bg-[color-mix(in_srgb,var(--income)_10%,transparent)] p-[.75rem_.85rem] text-[.88rem] font-medium text-income";

export const emptyStateClass =
  "flex items-center gap-4 rounded-2xl border border-dashed border-border bg-surface-subtle p-[clamp(1.25rem,4vw,2rem)] max-[540px]:items-start";

export const emptyIconClass =
  "grid size-12 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600";

export const emptyActionClass = "mt-[.85rem] w-full";

export const statePanelClass =
  "grid min-h-[60vh] place-items-center content-center gap-[.75rem] p-8 text-center";

export const fieldClass = "grid gap-[.45rem]";

export const fieldLabelClass = "text-[.9rem] font-medium";

export const fieldLabelRowClass =
  "flex items-center justify-between gap-4 text-[.9rem] font-medium";

export const fieldHintClass = "text-[.78rem] font-medium text-muted";

export const mutedLinkClass = "text-[.78rem] font-medium text-muted";

export const textLinkClass = "font-medium text-primary-600";

export const eyebrowClass =
  "mb-[.65rem] text-[.75rem] font-medium uppercase tracking-[.12em] text-primary-600 dark:text-[#93c5fd]";

export const pageStackClass = "grid gap-[1.75rem]";

export const passwordWrapClass = "relative";

export const passwordToggleClass =
  "absolute top-1/2 right-[.55rem] grid size-[2.2rem] -translate-y-1/2 cursor-pointer place-items-center rounded-[.55rem] border-0 bg-transparent text-muted hover:bg-primary-50 hover:text-primary-700";
