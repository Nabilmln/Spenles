export const buttonBase =
  "button inline-flex min-h-[2.6rem] cursor-pointer items-center justify-center gap-[.5rem] rounded-[.65rem] border border-transparent px-[.9rem] py-[.55rem] text-[.88rem] font-medium transition-[background,transform,box-shadow] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55";

export const buttonVariant: Record<string, string> = {
  primary: "bg-primary-600 text-white hover:enabled:bg-primary-700 shadow-[0_2px_12px_rgb(240_90_36/25%)] hover:enabled:shadow-[0_4px_18px_rgb(240_90_36/35%)]",
  secondary: "border-primary-600 bg-primary-600 text-white hover:enabled:bg-primary-700",
  blue: "bg-blue-600 text-white hover:enabled:bg-blue-700 shadow-[0_2px_12px_rgb(37_99_235/25%)] hover:enabled:shadow-[0_4px_18px_rgb(37_99_235/35%)]",
  ghost: "bg-transparent text-foreground hover:enabled:bg-surface-subtle",
  danger: "bg-expense text-white hover:enabled:opacity-90",
};

export function buttonClass(
  variant: keyof typeof buttonVariant = "primary",
  className?: string,
): string {
  return className ? `${buttonBase} ${buttonVariant[variant]} ${className}` : `${buttonBase} ${buttonVariant[variant]}`;
}

export const cardClass =
  "card rounded-[.85rem] border border-border bg-surface p-[.9rem] shadow-card";

export const inputClass =
  "w-full min-h-[2.6rem] rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-[.88rem] text-foreground transition-[border,box-shadow] duration-150 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgb(240_90_36/12%)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65";

export const textareaClass = `${inputClass} min-h-[7rem] resize-y`;

export const iconButtonClass =
  "grid size-[2.5rem] shrink-0 cursor-pointer place-items-center rounded-[.65rem] border border-border bg-surface text-muted hover:text-primary-600 hover:border-primary-100 transition-[border,color,background] duration-150";

export const inputDisplayClass =
  "flex min-h-[2.6rem] items-center rounded-[.65rem] border border-border bg-surface-subtle px-[.8rem] py-[.6rem] text-[.88rem] font-medium text-muted";

export const formMessageClass = "m-0 text-[.82rem] text-expense";

export const emptyStateClass =
  "flex items-center gap-4 rounded-[.85rem] border border-dashed border-border bg-surface-subtle p-[clamp(1rem,3vw,1.75rem)] max-[540px]:items-start";

export const emptyIconClass =
  "grid size-11 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-600";

export const emptyActionClass = "mt-[.75rem] w-full";

export const statePanelClass =
  "grid min-h-[60vh] place-items-center content-center gap-[.65rem] p-8 text-center";

export const fieldClass = "grid gap-[.4rem]";

export const fieldLabelClass = "text-[.85rem] font-medium";

export const fieldLabelRowClass =
  "flex items-center justify-between gap-4 text-[.85rem] font-medium";

export const fieldHintClass = "text-[.76rem] font-medium text-muted";

export const mutedLinkClass = "text-[.76rem] font-medium text-muted";

export const textLinkClass = "font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150";

export const eyebrowClass =
  "mb-[.5rem] text-[.7rem] font-semibold uppercase tracking-[.14em] text-primary-600 dark:text-primary-700";

export const pageStackClass = "grid gap-[1.5rem]";

export const pageHeadingRowClass =
  "flex items-start justify-between gap-4 max-[540px]:flex-col max-[540px]:items-stretch";

export const pageHeadingCopyClass = "min-w-0";

export const pageDescriptionClass = "m-0 max-w-[48rem] text-[.85rem] text-muted";

export const entityHeadingClass = "m-0 text-[1.2rem] tracking-[-.02em]";

export const narrowPageClass = "max-w-[48rem]";

export const pageActionsClass = "flex items-center gap-2";

export const passwordWrapClass = "relative";

export const passwordToggleClass =
  "absolute top-1/2 right-[.5rem] grid size-[2.1rem] -translate-y-1/2 cursor-pointer place-items-center rounded-[.5rem] border-0 bg-transparent text-muted hover:bg-primary-50 hover:text-primary-600";
