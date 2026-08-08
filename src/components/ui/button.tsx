import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { buttonBase, buttonVariant } from "./styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonBase, buttonVariant[variant], className)}
      {...props}
    />
  );
}
