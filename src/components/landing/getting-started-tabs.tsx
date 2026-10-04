"use client";

import { EllipsisVertical, Share, TabletSmartphone } from "lucide-react";
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { CopySiteLink } from "./copy-site-link";
import styles from "./desktop-landing.module.css";

const emphasis = "font-semibold text-[#171717]";
const stepIcon = "inline-block align-[-.2em] text-[#171717]";
const shortcutKey = "whitespace-nowrap rounded-[5px] border border-[#e3e5e6] bg-[#f5f6f7] px-[.3rem] py-[.08rem] text-[.78rem] text-[#171717]";
const tabs = [
  { id: "mobile", label: "From Mobile" },
  { id: "desktop", label: "From Desktop" },
  { id: "personal", label: "Personal Setup" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SetupStep({ number, children }: { number: number; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[29px_minmax(0,1fr)] items-start gap-[1.1rem] py-[.55rem] text-[.84rem] leading-[1.65]">
      <span className="grid size-[29px] place-items-center rounded-full bg-[#1b1b1b] text-[.74rem] text-white" aria-hidden="true">{number}</span>
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
    <div className="min-w-0 self-center" data-reveal="right">
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
            <ol className="m-0 grid list-none gap-1 p-0">
              <SetupStep number={1}>Open this site in your phone&apos;s browser.</SetupStep>
              <SetupStep number={2}>Create an account or sign in.</SetupStep>
              <SetupStep number={3}>
                <p className="m-0">Optional: add Spenles to your home screen.</p>
                <div className="mt-3 grid grid-cols-2 gap-4 [&>div]:border-l [&>div]:border-[#d5d9d9] [&>div]:pl-[.8rem] [&>div>strong]:block [&>div>strong]:text-[.76rem] [&_p]:mt-[.35rem] [&_p]:text-[.75rem] [&_p]:leading-[1.6] [&_p]:text-[#62645f]">
                  <div>
                    <strong>iPhone · Safari</strong>
                    <p>Tap <Share className={stepIcon} size={16} aria-hidden="true" /> <strong className={emphasis}>Share</strong> (or the page menu, then Share), then <strong className={emphasis}>Add to Home Screen</strong>. If shown, turn on Open as Web App, then tap Add.</p>
                  </div>
                  <div>
                    <strong>Android · Chrome</strong>
                    <p>Tap the <EllipsisVertical className={stepIcon} size={16} aria-hidden="true" /> <strong className={emphasis}>three-dot menu</strong>, look for <strong className={emphasis}>Install</strong> or <strong className={emphasis}>Add to Home screen</strong>, then confirm.</p>
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
            <ol className="m-0 grid list-none gap-1 p-0">
              <SetupStep number={1}>Open this site in Chrome or Edge on your computer.</SetupStep>
              <SetupStep number={2}>Right-click the page and choose <strong className={emphasis}>Inspect</strong>. You can also press <kbd className={shortcutKey}>F12</kbd> on Windows or <kbd className={shortcutKey}>Command + Option + I</kbd> on Mac.</SetupStep>
              <SetupStep number={3}>Click the <TabletSmartphone className={stepIcon} size={16} aria-hidden="true" /> phone-and-tablet icon at the top of the panel, then choose a phone. You can also press <kbd className={shortcutKey}>Ctrl + Shift + M</kbd> on Windows or <kbd className={shortcutKey}>Command + Shift + M</kbd> on Mac.</SetupStep>
            </ol>
            <p className="mt-[.7rem] text-[.76rem] leading-[1.6] text-[#62645f]">This previews the phone layout on your computer. To add Spenles to your home screen, use a real phone and follow From Mobile.</p>
            <CopySiteLink />
          </>
        )}
        {active === "personal" && (
          <>
            <ol className="m-0 grid list-none gap-1 p-0">
              <SetupStep number={1}>Open the Spenles project page. You will need access to it.</SetupStep>
              <SetupStep number={2}>Follow the setup instructions in its README to run your own copy.</SetupStep>
            </ol>
            <a className="mt-5 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#171717] px-[1.1rem] py-[.65rem] text-[.77rem] font-semibold text-white hover:bg-[#363636]" href="https://github.com/Nabilmln/Spenles" target="_blank" rel="noopener noreferrer">
              Open Spenles project page
            </a>
          </>
        )}
      </div>
    </div>
  );
}
