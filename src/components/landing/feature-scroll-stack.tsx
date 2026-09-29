import type { ReactNode } from "react";
import styles from "./desktop-landing.module.css";

export function ScrollStack({ children }: { children: ReactNode }) {
  return <div className={styles.featureStack}>{children}</div>;
}

export function ScrollStackItem({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return <article className={`${styles.featureStackCard} ${className}`}>{children}</article>;
}
