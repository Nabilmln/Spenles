"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import {
  createShareSummaryAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

export function ShareSummaryButton({ billId }: { billId: string }) {
  const [state, action, pending] = useActionState<
    SplitBillActionState,
    FormData
  >(createShareSummaryAction, {});
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!state.text) return;
    navigator.clipboard
      .writeText(state.text)
      .then(() => setCopyStatus("Ringkasan disalin."))
      .catch(() => setCopyStatus("Salin teks secara manual dari kotak ringkasan."));
  }, [state.text]);

  return (
    <form action={action} className="share-summary-form">
      <input type="hidden" name="id" value={billId} />
      <label>
        <input type="checkbox" name="includePaymentStatus" defaultChecked />
        Sertakan status pembayaran
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Membuat..." : "Salin Hasil Split Bill"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
      {copyStatus ? <p role="status">{copyStatus}</p> : null}
      {state.text ? (
        <textarea
          className="input textarea share-text"
          readOnly
          value={state.text}
          aria-label="Ringkasan tagihan siap disalin"
        />
      ) : null}
    </form>
  );
}
