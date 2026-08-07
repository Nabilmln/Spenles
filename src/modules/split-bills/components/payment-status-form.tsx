"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  updateParticipantPaymentAction,
  type SplitBillActionState,
} from "../actions/split-bill-actions";

export function PaymentStatusForm({
  billId,
  participantId,
  obligation,
  initialStatus,
  initialPaidAmount,
}: {
  billId: string;
  participantId: string;
  obligation: string;
  initialStatus: "unpaid" | "partially_paid" | "paid";
  initialPaidAmount: string;
}) {
  const [state, action, pending] = useActionState<
    SplitBillActionState,
    FormData
  >(updateParticipantPaymentAction, {});
  const [status, setStatus] = useState(initialStatus);
  const paidAmount =
    status === "unpaid"
      ? "0"
      : status === "paid"
        ? obligation
        : initialStatus === "partially_paid"
          ? initialPaidAmount
          : "";
  return (
    <form action={action} className="payment-form">
      <input type="hidden" name="billId" value={billId} />
      <input type="hidden" name="participantId" value={participantId} />
      <div className="field">
        <label htmlFor={`payment-status-${participantId}`}>Status</label>
        <Select
          id={`payment-status-${participantId}`}
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as "unpaid" | "partially_paid" | "paid",
            )
          }
        >
          <option value="unpaid">Belum dibayar</option>
          <option value="partially_paid">Dibayar sebagian</option>
          <option value="paid">Lunas</option>
        </Select>
      </div>
      {status === "partially_paid" ? (
        <div className="field">
          <label htmlFor={`paid-amount-${participantId}`}>
            Nominal dibayar
          </label>
          <Input
            id={`paid-amount-${participantId}`}
            name="paidAmount"
            type="number"
            min="1"
            max={BigInt(obligation) > 0n ? (BigInt(obligation) - 1n).toString() : "0"}
            step="1"
            defaultValue={paidAmount}
            required
          />
        </div>
      ) : (
        <input type="hidden" name="paidAmount" value={paidAmount} />
      )}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan status"}
      </Button>
      <FormMessage>{state.error}</FormMessage>
      {state.success ? <p role="status">{state.success}</p> : null}
    </form>
  );
}
