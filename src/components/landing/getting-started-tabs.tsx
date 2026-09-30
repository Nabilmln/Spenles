"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { CopySiteLink } from "./copy-site-link";
import styles from "./desktop-landing.module.css";

const tabs = [
  { id: "mobile", label: "From Mobile" },
  { id: "desktop", label: "From Desktop" },
  { id: "personal", label: "Personal Setup" },
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
      <div className={styles.setupTabs} data-active={active} role="tablist" aria-label="Ways to try Spenles" onKeyDown={onTabKeyDown}>
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
              <SetupStep number={3}>
                <p>Optional: add Spenles to your home screen.</p>
                <div className={styles.installGuides}>
                  <div>
                    <strong>iPhone · Safari</strong>
                    <p>Tap Share (or the page menu, then Share), then Add to Home Screen. If shown, turn on Open as Web App, then tap Add.</p>
                  </div>
                  <div>
                    <strong>Android · Chrome</strong>
                    <p>Tap the three-dot menu, look for Install or Add to Home screen, then confirm.</p>
                  </div>
                </div>
              </SetupStep>
              <SetupStep number={4}>Open Spenles and record your first transaction.</SetupStep>
            </ol>
            <CopySiteLink />
          </>
        )}
        {active === "desktop" && (
          <>
            <ol className={styles.setupSteps}>
              <SetupStep number={1}>Open this site in Chrome or Edge on your computer.</SetupStep>
              <SetupStep number={2}>Right-click the page and choose Inspect. A browser tools panel will open.</SetupStep>
              <SetupStep number={3}>Click the phone-and-tablet icon at the top of that panel, then choose a phone from the device menu.</SetupStep>
            </ol>
            <p className={styles.setupNote}>This previews the phone layout on your computer. To add Spenles to your home screen, use a real phone and follow From Mobile.</p>
            <CopySiteLink />
          </>
        )}
        {active === "personal" && (
          <>
            <ol className={styles.setupSteps}>
              <SetupStep number={1}>Open the Spenles project page. You will need access to it.</SetupStep>
              <SetupStep number={2}>Follow the setup instructions in its README to run your own copy.</SetupStep>
            </ol>
            <a className={styles.repositoryLink} href="https://github.com/Nabilmln/Spenles" target="_blank" rel="noopener noreferrer">
              Open Spenles project page
            </a>
          </>
        )}
      </div>
    </div>
  );
}
