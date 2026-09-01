"use client";

import { useEffect, useRef, useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { textareaClass } from "@/components/ui/styles";
import {
  createShareSummaryAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return fallbackCopy(text);
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  return succeeded
    ? Promise.resolve()
    : Promise.reject(new Error("Clipboard not available."));
}

export function ShareSummaryButton({ billId }: { billId: string }) {
  const [state, action, pending] = useToastActionState<
    SplitBillActionState,
    FormData
  >(createShareSummaryAction, {});
  const [copyStatus, setCopyStatus] = useState<
    "copied" | "failed" | ""
  >("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!state.text) return;
    copyToClipboard(state.text)
      .then(() => setCopyStatus("copied"))
      .catch(() => setCopyStatus("failed"));
  }, [state.text]);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  return (
    <form action={action} className="mt-[.5rem] grid gap-[.65rem]">
      <input type="hidden" name="id" value={billId} />
      <label className="inline-flex items-center gap-[.4rem] text-[.82rem]">
        <input type="checkbox" name="includePaymentStatus" defaultChecked />
        Include payment status
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Copying..." : "Copy"}
      </Button>
      {copyStatus === "copied" ? (
        <p className="m-0 text-[.78rem] font-medium text-income" role="status">
          Summary copied to clipboard.
        </p>
      ) : null}
      {copyStatus === "failed" ? (
        <p className="m-0 text-[.78rem] font-medium text-expense" role="alert">
          Automatic copy failed. Copy the text from the box below.
        </p>
      ) : null}
      {state.text ? (
        <>
          <textarea
            ref={textareaRef}
            className={`${textareaClass} min-h-[11rem] text-[.78rem]`}
            readOnly
            value={state.text}
            aria-label="Bill summary ready to copy"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!state.text) return;
              copyToClipboard(state.text)
                .then(() => setCopyStatus("copied"))
                .catch(() => setCopyStatus("failed"));
            }}
          >
            Copy again
          </Button>
        </>
      ) : null}
    </form>
  );
}
