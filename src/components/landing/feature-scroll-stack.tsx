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
  return <article className={`${styles.featureStackCard} ${className}`} data-scroll-stack-card>{children}</article>;
}
