"use client";

import { Check, Copy } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

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
    <div className="mt-[1.6rem] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[14px] border border-[#d9dcda] bg-[#f8f9f9] p-[.4rem]">
      <span className="min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap pl-[.7rem] text-[.77rem] text-[#555853] select-all" title={siteUrl}>
        {siteUrl || "This site's address"}
      </span>
      <button
        className="inline-flex min-h-[41px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#171717] px-[.9rem] py-2 text-[.76rem] font-semibold text-white hover:bg-[#363636] disabled:cursor-wait disabled:opacity-60"
        disabled={!siteUrl}
        onClick={copyLink}
        type="button"
      >
        {status === "copied" ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
        {status === "copied" ? "Copied" : "Copy link"}
      </button>
      <span aria-live="polite" className="col-span-full text-xs text-[#a52a2a] empty:hidden">
        {status === "error" ? "Copy failed. Select the address above instead." : ""}
      </span>
    </div>
  );
}
