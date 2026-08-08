import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { inputClass } from "./styles";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}
