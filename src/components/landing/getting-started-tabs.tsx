"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { CopySiteLink } from "./copy-site-link";
import styles from "./desktop-landing.module.css";

const tabs = [
  { id: "mobile", label: "From Mobile" },
  { id: "desktop", label: "From Desktop" },
  { id: "personal", label: "Personal Use" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SetupStep({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li>
      <span aria-hidden="true">{number}</span>
      <div>{children}</div>
    </li>
  );
}

export function GettingStartedTabs() {
  const [active, setActive] = useState<TabId>("mobile");
  const id = useId();

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = tabs.findIndex((tab) => tab.id === active);
    const next = event.key === "ArrowRight"
      ? (current + 1) % tabs.length
      : event.key === "ArrowLeft"
        ? (current + tabs.length - 1) % tabs.length
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(tabs[next].id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className={styles.setupChooser} data-reveal="right">
      <div className={styles.setupTabs} role="tablist" aria-label="Ways to try Spenles" onKeyDown={onTabKeyDown}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${id}-${tab.id}-tab`}
            role="tab"
            type="button"
            aria-controls={active === tab.id ? `${id}-${tab.id}-panel` : undefined}
            aria-selected={active === tab.id}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        key={active}
        className={styles.setupPanel}
        id={`${id}-${active}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${active}-tab`}
        tabIndex={0}
      >
        {active === "mobile" && (
          <>
            <ol className={styles.setupSteps}>
              <SetupStep number={1}>Open this site in your phone&apos;s browser.</SetupStep>
              <SetupStep number={2}>Create an account or sign in.</SetupStep>
              <SetupStep number={3}>Add Spenles to your home screen if you like, then record your first transaction.</SetupStep>
            </ol>
            <CopySiteLink />
          </>
        )}
        {active === "desktop" && (
          <>
            <ol className={styles.setupSteps}>
              <SetupStep number={1}>Open this site in Chrome or Edge on your computer.</SetupStep>
              <SetupStep number={2}>Open Developer Tools with <kbd>F12</kbd> or <kbd>⌘⌥I</kbd> on Mac.</SetupStep>
              <SetupStep number={3}>Turn on the device toolbar with <kbd>Ctrl+Shift+M</kbd> or <kbd>⌘⇧M</kbd> on Mac. Choose a phone width below 861 px.</SetupStep>
            </ol>
            <p className={styles.setupNote}>This previews the phone layout. Use a real phone to install the PWA.</p>
            <CopySiteLink />
          </>
        )}
        {active === "personal" && (
          <>
            <ol className={styles.setupSteps}>
              <SetupStep number={1}>Open the repository and follow its README. Repository access is required.</SetupStep>
              <SetupStep number={2}>Clone it, use Node.js 22, and run <code>npm ci</code>.</SetupStep>
              <SetupStep number={3}>Copy <code>.env.example</code> to <code>.env.local</code> and configure your own Neon database and Auth.</SetupStep>
              <SetupStep number={4}>Run <code>npm run db:migrate</code>, then <code>npm run dev</code>.</SetupStep>
            </ol>
            <a className={styles.repositoryLink} href="https://github.com/Nabilmln/Spenles" target="_blank" rel="noopener noreferrer">
              Open Spenles repository
            </a>
          </>
        )}
      </div>
    </div>
  );
}
