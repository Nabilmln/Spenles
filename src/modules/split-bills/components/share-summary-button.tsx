"use client";

import { useEffect, useState } from "react";
import { useToastActionState } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { textareaClass } from "@/components/ui/styles";
import {
  createShareSummaryAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

export function ShareSummaryButton({ billId }: { billId: string }) {
  const [state, action, pending] = useToastActionState<
    SplitBillActionState,
    FormData
  >(createShareSummaryAction, {});
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!state.text) return;
    navigator.clipboard
      .writeText(state.text)
      .then(() => setCopyStatus("Copied!"))
      .catch(() => setCopyStatus("Salin teks secara manual dari kotak ringkasan."));
  }, [state.text]);

  return (
    <form action={action} className="mt-[.5rem] grid gap-[.65rem]">
      <input type="hidden" name="id" value={billId} />
      <label className="inline-flex items-center gap-[.4rem] text-[.82rem]">
        <input type="checkbox" name="includePaymentStatus" defaultChecked />
        Sertakan status pembayaran
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyalin..." : "Copy"}
      </Button>
      {copyStatus ? <p role="status">{copyStatus}</p> : null}
      {state.text ? (
        <textarea
          className={`${textareaClass} min-h-[11rem] text-[.78rem]`}
          readOnly
          value={state.text}
          aria-label="Ringkasan tagihan siap disalin"
        />
      ) : null}
    </form>
  );
}
