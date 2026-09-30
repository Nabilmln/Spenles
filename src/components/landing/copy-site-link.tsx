"use client";

import { Check, Copy } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import styles from "./desktop-landing.module.css";

const subscribe = () => () => {};
const getServerSiteUrl = () => "";
const getSiteUrl = () => new URL("/", window.location.href).href;

export function CopySiteLink() {
  const siteUrl = useSyncExternalStore(subscribe, getSiteUrl, getServerSiteUrl);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.linkTool}>
      <span className={styles.siteUrl} title={siteUrl}>
        {siteUrl || "This site's address"}
      </span>
      <button
        className={styles.copyButton}
        disabled={!siteUrl}
        onClick={copyLink}
        type="button"
      >
        {status === "copied" ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
        {status === "copied" ? "Copied" : "Copy link"}
      </button>
      <span aria-live="polite" className={styles.copyMessage}>
        {status === "error" ? "Copy failed. Select the address above instead." : ""}
      </span>
    </div>
  );
}
