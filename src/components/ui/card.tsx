import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cardClass } from "./styles";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardClass, className)} {...props} />;
}
