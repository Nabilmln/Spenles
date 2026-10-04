import type { ReactNode } from "react";
import styles from "./desktop-landing.module.css";

export function ScrollStack({ children }: { children: ReactNode }) {
  return (
    <div className={styles.featureStack} data-scroll-stack>
      <div className={styles.featureStackStage} data-scroll-stack-stage>{children}</div>
    </div>
  );
}

export function ScrollStackItem({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return <article className={`${styles.featureStackCard} relative min-w-0 min-h-[var(--stack-card-height)] overflow-hidden rounded-[30px] border border-[#e1e4e6] bg-white text-[#171717] shadow-[0_22px_58px_rgb(20_26_32_/_9%)] ${className}`} data-scroll-stack-card>{children}</article>;
}
